package config

import (
	"errors"
	"fmt"
	"net"
	"net/mail"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/joho/godotenv"
)

type Config struct {
	Environment string
	Migrations  string
	HTTP        HTTPConfig
	Postgres    PostgresConfig
	Redis       RedisConfig
	JWT         JWTConfig
	Admin       AdminConfig
}

type HTTPConfig struct {
	Address        string
	AllowedOrigins []string
	ReadTimeout    time.Duration
	WriteTimeout   time.Duration
	IdleTimeout    time.Duration
}

type PostgresConfig struct {
	URL             string
	Host            string
	Port            int
	User            string
	Password        string
	Name            string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

func (c PostgresConfig) ConnectionURL() string {
	if c.URL != "" {
		return c.URL
	}
	value := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(c.User, c.Password),
		Host:   net.JoinHostPort(c.Host, strconv.Itoa(c.Port)),
		Path:   c.Name,
	}
	query := value.Query()
	query.Set("sslmode", c.SSLMode)
	value.RawQuery = query.Encode()
	return value.String()
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

func (c RedisConfig) Address() string {
	return net.JoinHostPort(c.Host, strconv.Itoa(c.Port))
}

type JWTConfig struct {
	AccessSecret  string
	RefreshSecret string
	Issuer        string
	Audience      string
	AccessTTL     time.Duration
	RefreshTTL    time.Duration
}

type AdminConfig struct {
	Username string
	Email    string
	Password string
}

func Load() (result Config, err error) {
	defer func() {
		if recovered := recover(); recovered != nil {
			result = Config{}
			err = fmt.Errorf("invalid configuration: %v", recovered)
		}
	}()
	_ = godotenv.Load()

	port := env("APP_PORT", "8080")
	address := strings.TrimSpace(os.Getenv("HTTP_ADDRESS"))
	if address == "" {
		address = ":" + port
	}
	redisHost, redisPort := redisAddressParts()
	cfg := Config{
		Environment: env("APP_ENV", "development"),
		Migrations:  env("MIGRATIONS_URL", "file://migrations"),
		HTTP: HTTPConfig{
			Address:        address,
			AllowedOrigins: splitCSV(env("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
			ReadTimeout:    duration("HTTP_READ_TIMEOUT", 10*time.Second),
			WriteTimeout:   duration("HTTP_WRITE_TIMEOUT", 15*time.Second),
			IdleTimeout:    duration("HTTP_IDLE_TIMEOUT", 60*time.Second),
		},
		Postgres: PostgresConfig{
			URL:             strings.TrimSpace(os.Getenv("DATABASE_URL")),
			Host:            strings.TrimSpace(os.Getenv("DB_HOST")),
			Port:            integer("DB_PORT", 5432),
			User:            strings.TrimSpace(os.Getenv("DB_USER")),
			Password:        os.Getenv("DB_PASSWORD"),
			Name:            strings.TrimSpace(os.Getenv("DB_NAME")),
			SSLMode:         env("DB_SSLMODE", "disable"),
			MaxOpenConns:    integer("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    integer("DB_MAX_IDLE_CONNS", 10),
			ConnMaxLifetime: duration("DB_CONN_MAX_LIFETIME", 30*time.Minute),
		},
		Redis: RedisConfig{
			Host:     redisHost,
			Port:     redisPort,
			Password: os.Getenv("REDIS_PASSWORD"),
			DB:       integer("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			AccessSecret:  strings.TrimSpace(os.Getenv("JWT_ACCESS_SECRET")),
			RefreshSecret: strings.TrimSpace(os.Getenv("JWT_REFRESH_SECRET")),
			Issuer:        env("JWT_ISSUER", "quiet-api"),
			Audience:      env("JWT_AUDIENCE", "quiet-web"),
			AccessTTL:     durationAliases([]string{"JWT_ACCESS_EXPIRATION", "JWT_ACCESS_TTL"}, 15*time.Minute),
			RefreshTTL:    durationAliases([]string{"JWT_REFRESH_EXPIRATION", "JWT_REFRESH_TTL"}, 7*24*time.Hour),
		},
		Admin: AdminConfig{
			Username: strings.TrimSpace(os.Getenv("INITIAL_ADMIN_USERNAME")),
			Email:    strings.TrimSpace(os.Getenv("INITIAL_ADMIN_EMAIL")),
			Password: os.Getenv("INITIAL_ADMIN_PASSWORD"),
		},
	}
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) Validate() error {
	var problems []string
	if c.Postgres.URL == "" {
		for name, value := range map[string]string{
			"DB_HOST": c.Postgres.Host, "DB_USER": c.Postgres.User,
			"DB_PASSWORD": c.Postgres.Password, "DB_NAME": c.Postgres.Name,
		} {
			if value == "" {
				problems = append(problems, name+" is required when DATABASE_URL is not set")
			}
		}
	}
	if c.Postgres.Port <= 0 || c.Postgres.Port > 65535 {
		problems = append(problems, "DB_PORT must be a valid port")
	}
	if c.Redis.Host == "" {
		problems = append(problems, "REDIS_HOST is required")
	}
	if c.Redis.Port <= 0 || c.Redis.Port > 65535 {
		problems = append(problems, "REDIS_PORT must be a valid port")
	}
	if len(c.JWT.AccessSecret) < 32 {
		problems = append(problems, "JWT_ACCESS_SECRET must be at least 32 characters")
	}
	if len(c.JWT.RefreshSecret) < 32 {
		problems = append(problems, "JWT_REFRESH_SECRET must be at least 32 characters")
	}
	if strings.HasPrefix(c.JWT.AccessSecret, "replace_") || strings.HasPrefix(c.JWT.RefreshSecret, "replace_") {
		problems = append(problems, "JWT secrets must be replaced with generated random values")
	}
	if c.JWT.AccessSecret != "" && c.JWT.AccessSecret == c.JWT.RefreshSecret {
		problems = append(problems, "JWT access and refresh secrets must be different")
	}
	if c.JWT.AccessTTL <= 0 || c.JWT.RefreshTTL <= c.JWT.AccessTTL {
		problems = append(problems, "JWT refresh expiration must be greater than the positive access expiration")
	}
	if c.Environment == "production" {
		if len(c.HTTP.AllowedOrigins) == 0 || contains(c.HTTP.AllowedOrigins, "*") {
			problems = append(problems, "production CORS_ALLOWED_ORIGINS must list explicit origins")
		}
		if c.Postgres.Password == "quiet_password" {
			problems = append(problems, "production DB_PASSWORD must not use the local development default")
		}
		if c.Admin.Password == "ChangeThisPassword123!" {
			problems = append(problems, "production INITIAL_ADMIN_PASSWORD must not use the example value")
		}
	}
	adminValues := 0
	for _, value := range []string{c.Admin.Username, c.Admin.Email, c.Admin.Password} {
		if value != "" {
			adminValues++
		}
	}
	if adminValues != 0 && adminValues != 3 {
		problems = append(problems, "INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD must be set together")
	}
	if adminValues == 3 {
		address, err := mail.ParseAddress(c.Admin.Email)
		if err != nil || address.Address != c.Admin.Email || len(c.Admin.Email) > 320 {
			problems = append(problems, "INITIAL_ADMIN_EMAIL must be a valid email address")
		}
		if len(c.Admin.Password) < 12 || len(c.Admin.Password) > 72 {
			problems = append(problems, "INITIAL_ADMIN_PASSWORD must contain 12 to 72 bytes")
		}
		if !regexp.MustCompile(`^[a-z0-9][a-z0-9_-]{2,63}$`).MatchString(c.Admin.Username) {
			problems = append(problems, "INITIAL_ADMIN_USERNAME must be 3-64 lowercase letters, numbers, underscores, or hyphens")
		}
		if !strongPassword(c.Admin.Password) {
			problems = append(problems, "INITIAL_ADMIN_PASSWORD must include uppercase, lowercase, and a number")
		}
	}
	if len(problems) > 0 {
		return errors.New(strings.Join(problems, "; "))
	}
	return nil
}

func strongPassword(value string) bool {
	var upper, lower, number bool
	for _, char := range value {
		upper = upper || unicode.IsUpper(char)
		lower = lower || unicode.IsLower(char)
		number = number || unicode.IsDigit(char)
	}
	return upper && lower && number
}

func redisAddressParts() (string, int) {
	host := strings.TrimSpace(os.Getenv("REDIS_HOST"))
	port := integer("REDIS_PORT", 6379)
	if legacy := strings.TrimSpace(os.Getenv("REDIS_ADDRESS")); legacy != "" && host == "" {
		legacyHost, legacyPort, err := net.SplitHostPort(legacy)
		if err != nil {
			panic(fmt.Sprintf("invalid REDIS_ADDRESS=%q", legacy))
		}
		host = legacyHost
		parsedPort, err := strconv.Atoi(legacyPort)
		if err != nil {
			panic(fmt.Sprintf("invalid REDIS_ADDRESS port=%q", legacyPort))
		}
		port = parsedPort
	}
	return host, port
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func integer(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		panic(fmt.Sprintf("invalid integer %s=%q", key, value))
	}
	return parsed
}

func duration(key string, fallback time.Duration) time.Duration {
	return durationAliases([]string{key}, fallback)
}

func durationAliases(keys []string, fallback time.Duration) time.Duration {
	for _, key := range keys {
		value := strings.TrimSpace(os.Getenv(key))
		if value == "" {
			continue
		}
		parsed, err := time.ParseDuration(value)
		if err != nil {
			panic(fmt.Sprintf("invalid duration %s=%q", key, value))
		}
		return parsed
	}
	return fallback
}

func splitCSV(value string) []string {
	values := strings.Split(value, ",")
	result := make([]string, 0, len(values))
	for _, item := range values {
		if item = strings.TrimSpace(item); item != "" {
			result = append(result, item)
		}
	}
	return result
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
