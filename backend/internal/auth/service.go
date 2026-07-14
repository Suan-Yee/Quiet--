package auth

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/suan-yee/Quiet/internal/token"
	"github.com/suan-yee/Quiet/internal/user"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailInUse         = errors.New("email is already registered")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInactiveUser       = errors.New("user account is inactive")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrInvalidInput       = errors.New("invalid registration input")
)

type UserRepository interface {
	Create(ctx context.Context, value *user.User) error
	FindByEmail(ctx context.Context, email string) (*user.User, error)
	FindByID(ctx context.Context, id uuid.UUID) (*user.User, error)
	FindByUsername(ctx context.Context, username string) (*user.User, error)
	UsernameExists(ctx context.Context, username string) (bool, error)
}

type TokenService interface {
	Issue(ctx context.Context, userID uuid.UUID, role string) (token.Pair, error)
	Refresh(ctx context.Context, rawRefreshToken string) (token.Pair, error)
	Logout(ctx context.Context, rawRefreshToken string) error
}

type Service struct {
	users  UserRepository
	tokens TokenService
}

func NewService(users UserRepository, tokens TokenService) *Service {
	return &Service{users: users, tokens: tokens}
}

func (s *Service) Register(ctx context.Context, input SignupRequest) (AuthenticationResponse, error) {
	name := strings.TrimSpace(input.Name)
	email := normalizeEmail(input.Email)
	address, emailErr := mail.ParseAddress(email)
	if name == "" || utf8.RuneCountInString(name) > 120 || emailErr != nil || address.Address != email || !ValidPassword(input.Password) || input.Password != input.ConfirmPassword {
		return AuthenticationResponse{}, ErrInvalidInput
	}
	if _, err := s.users.FindByEmail(ctx, email); err == nil {
		return AuthenticationResponse{}, ErrEmailInUse
	} else if !errors.Is(err, user.ErrNotFound) {
		return AuthenticationResponse{}, fmt.Errorf("check existing email: %w", err)
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return AuthenticationResponse{}, fmt.Errorf("hash password: %w", err)
	}
	value := &user.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(passwordHash),
		Role:         user.RoleUser,
		IsActive:     true,
	}
	if err := s.createWithAvailableUsername(ctx, value); err != nil {
		return AuthenticationResponse{}, err
	}
	pair, err := s.tokens.Issue(ctx, value.ID, string(value.Role))
	if err != nil {
		return AuthenticationResponse{}, fmt.Errorf("issue tokens: %w", err)
	}
	return newAuthenticationResponse(user.ToResponse(value), pair), nil
}

func (s *Service) Login(ctx context.Context, input LoginRequest) (AuthenticationResponse, error) {
	value, err := s.users.FindByEmail(ctx, normalizeEmail(input.Email))
	if err != nil {
		if errors.Is(err, user.ErrNotFound) {
			return AuthenticationResponse{}, ErrInvalidCredentials
		}
		return AuthenticationResponse{}, fmt.Errorf("find user: %w", err)
	}
	if bcrypt.CompareHashAndPassword([]byte(value.PasswordHash), []byte(input.Password)) != nil {
		return AuthenticationResponse{}, ErrInvalidCredentials
	}
	if !value.IsActive {
		return AuthenticationResponse{}, ErrInactiveUser
	}
	pair, err := s.tokens.Issue(ctx, value.ID, string(value.Role))
	if err != nil {
		return AuthenticationResponse{}, fmt.Errorf("issue tokens: %w", err)
	}
	return newAuthenticationResponse(user.ToResponse(value), pair), nil
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (TokenResponse, error) {
	pair, err := s.tokens.Refresh(ctx, refreshToken)
	if errors.Is(err, token.ErrInvalidToken) {
		return TokenResponse{}, ErrUnauthorized
	}
	if err != nil {
		return TokenResponse{}, err
	}
	return newTokenResponse(pair), nil
}

func (s *Service) Logout(ctx context.Context, refreshToken string) error {
	err := s.tokens.Logout(ctx, refreshToken)
	if errors.Is(err, token.ErrInvalidToken) {
		return ErrUnauthorized
	}
	return err
}

func (s *Service) CurrentUser(ctx context.Context, userID uuid.UUID) (UserResponse, error) {
	value, err := s.users.FindByID(ctx, userID)
	if errors.Is(err, user.ErrNotFound) {
		return UserResponse{}, ErrUnauthorized
	}
	if err != nil {
		return UserResponse{}, fmt.Errorf("find current user: %w", err)
	}
	if !value.IsActive {
		return UserResponse{}, ErrInactiveUser
	}
	return UserResponse{User: user.ToResponse(value)}, nil
}

func (s *Service) BootstrapAdmin(ctx context.Context, username, email, password string) (bool, error) {
	if username == "" && email == "" && password == "" {
		return false, nil
	}
	email = normalizeEmail(email)
	username = strings.ToLower(strings.TrimSpace(username))
	if !regexp.MustCompile(`^[a-z0-9][a-z0-9_-]{2,63}$`).MatchString(username) {
		return false, errors.New("INITIAL_ADMIN_USERNAME must be 3-64 lowercase letters, numbers, underscores, or hyphens")
	}
	if len(password) < 12 || !ValidPassword(password) {
		return false, errors.New("INITIAL_ADMIN_PASSWORD must be at least 12 characters and include uppercase, lowercase, and a number")
	}
	existing, err := s.users.FindByEmail(ctx, email)
	if err == nil {
		if existing.Role != user.RoleAdmin {
			return false, errors.New("INITIAL_ADMIN_EMAIL belongs to a non-admin account")
		}
		return false, nil
	}
	if !errors.Is(err, user.ErrNotFound) {
		return false, fmt.Errorf("check admin account: %w", err)
	}
	if _, err := s.users.FindByUsername(ctx, username); err == nil {
		return false, errors.New("INITIAL_ADMIN_USERNAME is already in use")
	} else if !errors.Is(err, user.ErrNotFound) {
		return false, fmt.Errorf("check admin username: %w", err)
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return false, fmt.Errorf("hash admin password: %w", err)
	}
	admin := &user.User{
		Name:         username,
		Username:     username,
		Email:        email,
		PasswordHash: string(hash),
		Role:         user.RoleAdmin,
		IsActive:     true,
	}
	if err := s.users.Create(ctx, admin); err != nil {
		if errors.Is(err, user.ErrDuplicate) {
			existing, findErr := s.users.FindByEmail(ctx, email)
			if findErr == nil && existing.Role == user.RoleAdmin {
				return false, nil
			}
		}
		return false, fmt.Errorf("create admin account: %w", err)
	}
	return true, nil
}

func ValidPassword(password string) bool {
	if len(password) < 8 || len(password) > 72 {
		return false
	}
	var hasUpper, hasLower, hasNumber bool
	for _, char := range password {
		hasUpper = hasUpper || unicode.IsUpper(char)
		hasLower = hasLower || unicode.IsLower(char)
		hasNumber = hasNumber || unicode.IsDigit(char)
	}
	return hasUpper && hasLower && hasNumber
}

func (s *Service) availableUsername(ctx context.Context, name string) (string, error) {
	base := slugify(name)
	for index := 1; index <= 10_000; index++ {
		candidate := base
		if index > 1 {
			candidate = fmt.Sprintf("%s-%d", base, index)
		}
		exists, err := s.users.UsernameExists(ctx, candidate)
		if err != nil {
			return "", fmt.Errorf("check username: %w", err)
		}
		if !exists {
			return candidate, nil
		}
	}
	return "", errors.New("could not allocate username")
}

func (s *Service) createWithAvailableUsername(ctx context.Context, value *user.User) error {
	for attempt := 0; attempt < 5; attempt++ {
		username, err := s.availableUsername(ctx, value.Name)
		if err != nil {
			return err
		}
		value.Username = username
		err = s.users.Create(ctx, value)
		if err == nil {
			return nil
		}
		if !errors.Is(err, user.ErrDuplicate) {
			return fmt.Errorf("create user: %w", err)
		}
		if _, emailErr := s.users.FindByEmail(ctx, value.Email); emailErr == nil {
			return ErrEmailInUse
		} else if !errors.Is(emailErr, user.ErrNotFound) {
			return fmt.Errorf("check duplicate email: %w", emailErr)
		}
	}
	return errors.New("could not create user after resolving username conflicts")
}

func slugify(value string) string {
	var builder strings.Builder
	lastWasDash := false
	for _, char := range strings.ToLower(strings.TrimSpace(value)) {
		switch {
		case unicode.IsLetter(char) || unicode.IsDigit(char):
			builder.WriteRune(char)
			lastWasDash = false
		case !lastWasDash && builder.Len() > 0:
			builder.WriteByte('-')
			lastWasDash = true
		}
		if builder.Len() >= 48 {
			break
		}
	}
	result := strings.Trim(builder.String(), "-")
	if result == "" {
		return "user"
	}
	return result
}

func normalizeEmail(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}
