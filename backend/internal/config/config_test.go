package config

import (
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func validConfig() Config {
	return Config{
		Environment: "development",
		HTTP:        HTTPConfig{AllowedOrigins: []string{"http://localhost:5173"}},
		Postgres:    PostgresConfig{Host: "postgres", Port: 5432, User: "quiet_user", Password: "quiet_password", Name: "quiet", SSLMode: "disable"},
		Redis:       RedisConfig{Host: "redis", Port: 6379},
		JWT: JWTConfig{
			AccessSecret: "random-access-secret-with-32-characters-123", RefreshSecret: "random-refresh-secret-with-32-characters-456",
			AccessTTL: 15 * time.Minute, RefreshTTL: 7 * 24 * time.Hour,
		},
	}
}

func TestValidateRejectsMissingDatabaseSettings(t *testing.T) {
	cfg := validConfig()
	cfg.Postgres.Host = ""
	err := cfg.Validate()
	require.Error(t, err)
	require.Contains(t, err.Error(), "DB_HOST is required")
}

func TestValidateRejectsKnownPlaceholderSecrets(t *testing.T) {
	cfg := validConfig()
	cfg.JWT.AccessSecret = "replace_with_a_long_random_access_secret"
	err := cfg.Validate()
	require.Error(t, err)
	require.Contains(t, err.Error(), "must be replaced")
}

func TestValidateRejectsWildcardCORSInProduction(t *testing.T) {
	cfg := validConfig()
	cfg.Environment = "production"
	cfg.HTTP.AllowedOrigins = []string{"*"}
	err := cfg.Validate()
	require.Error(t, err)
	require.Contains(t, err.Error(), "explicit origins")
}

func TestValidateRejectsDevelopmentCredentialsInProduction(t *testing.T) {
	cfg := validConfig()
	cfg.Environment = "production"
	cfg.Postgres.Password = "quiet_password"
	err := cfg.Validate()
	require.Error(t, err)
	require.Contains(t, err.Error(), "local development default")
}

func TestConnectionURLEscapesCredentials(t *testing.T) {
	cfg := validConfig().Postgres
	cfg.Password = "local p@ss"
	connectionURL := cfg.ConnectionURL()
	require.True(t, strings.Contains(connectionURL, "local%20p%40ss"), connectionURL)
}
