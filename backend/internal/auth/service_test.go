package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/suan-yee/Quiet/internal/token"
	"github.com/suan-yee/Quiet/internal/user"
)

type fakeUserRepository struct {
	byID    map[uuid.UUID]*user.User
	byEmail map[string]*user.User
}

func newFakeUserRepository() *fakeUserRepository {
	return &fakeUserRepository{byID: map[uuid.UUID]*user.User{}, byEmail: map[string]*user.User{}}
}

func (r *fakeUserRepository) Create(_ context.Context, value *user.User) error {
	if _, exists := r.byEmail[value.Email]; exists {
		return user.ErrDuplicate
	}
	for _, existing := range r.byID {
		if existing.Username == value.Username {
			return user.ErrDuplicate
		}
	}
	value.ID = uuid.New()
	r.byID[value.ID] = value
	r.byEmail[value.Email] = value
	return nil
}

func (r *fakeUserRepository) FindByEmail(_ context.Context, email string) (*user.User, error) {
	value, exists := r.byEmail[email]
	if !exists {
		return nil, user.ErrNotFound
	}
	return value, nil
}

func (r *fakeUserRepository) FindByID(_ context.Context, id uuid.UUID) (*user.User, error) {
	value, exists := r.byID[id]
	if !exists {
		return nil, user.ErrNotFound
	}
	return value, nil
}

func (r *fakeUserRepository) FindByUsername(_ context.Context, username string) (*user.User, error) {
	for _, value := range r.byID {
		if value.Username == username {
			return value, nil
		}
	}
	return nil, user.ErrNotFound
}

func (r *fakeUserRepository) UsernameExists(_ context.Context, username string) (bool, error) {
	for _, value := range r.byID {
		if value.Username == username {
			return true, nil
		}
	}
	return false, nil
}

type fakeTokenService struct{}

func (fakeTokenService) Issue(_ context.Context, _ uuid.UUID, _ string) (token.Pair, error) {
	return token.Pair{AccessToken: "access", RefreshToken: "refresh", TokenType: "Bearer"}, nil
}

func (fakeTokenService) Refresh(_ context.Context, raw string) (token.Pair, error) {
	if raw == "valid" {
		return token.Pair{AccessToken: "new-access", RefreshToken: "new-refresh"}, nil
	}
	return token.Pair{}, token.ErrInvalidToken
}

func (fakeTokenService) Logout(_ context.Context, raw string) error {
	if raw != "valid" {
		return token.ErrInvalidToken
	}
	return nil
}

func TestRegisterMatchesFrontendContract(t *testing.T) {
	repository := newFakeUserRepository()
	service := NewService(repository, fakeTokenService{})

	response, err := service.Register(context.Background(), RegisterRequest{
		Name:            "  Maya Chen  ",
		Email:           " MAYA@Example.com ",
		Password:        "Secret12",
		ConfirmPassword: "Secret12",
	})
	require.NoError(t, err)
	require.Equal(t, "Maya Chen", response.User.Name)
	require.Equal(t, "maya-chen", response.User.Username)
	require.Equal(t, "maya@example.com", response.User.Email)
	require.Equal(t, user.RoleUser, response.User.Role)
	require.True(t, response.User.IsActive)
	require.NotEmpty(t, repository.byEmail["maya@example.com"].PasswordHash)
	require.Equal(t, "access", response.AccessToken)
}

func TestLoginUsesGenericCredentialError(t *testing.T) {
	service := NewService(newFakeUserRepository(), fakeTokenService{})

	_, err := service.Login(context.Background(), LoginRequest{Email: "missing@example.com", Password: "wrong"})
	require.ErrorIs(t, err, ErrInvalidCredentials)
}

func TestRegisterAddsSuffixWhenNameIsAlreadyUsed(t *testing.T) {
	repository := newFakeUserRepository()
	service := NewService(repository, fakeTokenService{})

	for _, email := range []string{"first@example.com", "second@example.com"} {
		_, err := service.Register(context.Background(), RegisterRequest{
			Name: "Maya Chen", Email: email, Password: "Secret12", ConfirmPassword: "Secret12",
		})
		require.NoError(t, err)
	}
	require.Equal(t, "maya-chen", repository.byEmail["first@example.com"].Username)
	require.Equal(t, "maya-chen-2", repository.byEmail["second@example.com"].Username)
}

func TestBootstrapAdminIsIdempotent(t *testing.T) {
	repository := newFakeUserRepository()
	service := NewService(repository, fakeTokenService{})

	created, err := service.BootstrapAdmin(context.Background(), "quietadmin", "admin@example.com", "LongAdminPassword1")
	require.NoError(t, err)
	require.True(t, created)
	require.Equal(t, user.RoleAdmin, repository.byEmail["admin@example.com"].Role)

	created, err = service.BootstrapAdmin(context.Background(), "quietadmin", "admin@example.com", "LongAdminPassword1")
	require.NoError(t, err)
	require.False(t, created)
}

func TestRefreshMapsInvalidTokenToUnauthorized(t *testing.T) {
	service := NewService(newFakeUserRepository(), fakeTokenService{})
	_, err := service.Refresh(context.Background(), "invalid")
	require.True(t, errors.Is(err, ErrUnauthorized))
}

func TestPasswordPolicy(t *testing.T) {
	require.True(t, ValidPassword("QuietPass1"))
	for _, password := range []string{"short1A", "quietpass1", "QUIETPASS1", "QuietPassword"} {
		require.False(t, ValidPassword(password), password)
	}
}
