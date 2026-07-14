package token

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/suan-yee/Quiet/internal/config"
)

type memorySessionStore struct {
	mu       sync.Mutex
	sessions map[string]uuid.UUID
}

func newMemorySessionStore() *memorySessionStore {
	return &memorySessionStore{sessions: make(map[string]uuid.UUID)}
}

func (s *memorySessionStore) Create(_ context.Context, sessionID string, userID uuid.UUID, _ time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[sessionID] = userID
	return nil
}

func (s *memorySessionStore) GetUserID(_ context.Context, sessionID string) (uuid.UUID, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	userID, ok := s.sessions[sessionID]
	if !ok {
		return uuid.Nil, ErrSessionNotFound
	}
	return userID, nil
}

func (s *memorySessionStore) Rotate(_ context.Context, oldSessionID, newSessionID string, userID uuid.UUID, _ time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	storedUserID, ok := s.sessions[oldSessionID]
	if !ok || storedUserID != userID {
		return ErrSessionNotFound
	}
	delete(s.sessions, oldSessionID)
	s.sessions[newSessionID] = userID
	return nil
}

func (s *memorySessionStore) Delete(_ context.Context, sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, sessionID)
	return nil
}

func testService(store SessionStore) *Service {
	return NewService(store, config.JWTConfig{
		AccessSecret:  "access-secret-with-at-least-thirty-two-characters",
		RefreshSecret: "refresh-secret-with-at-least-thirty-two-characters",
		Issuer:        "quiet-test",
		Audience:      "quiet-test-client",
		AccessTTL:     15 * time.Minute,
		RefreshTTL:    24 * time.Hour,
	})
}

func TestRefreshRotatesSessionAndRejectsReplay(t *testing.T) {
	ctx := context.Background()
	service := testService(newMemorySessionStore())
	expectedUserID := uuid.New()

	initial, err := service.Issue(ctx, expectedUserID, "user")
	require.NoError(t, err)
	identity, err := service.Authenticate(ctx, initial.AccessToken)
	require.NoError(t, err)
	require.Equal(t, expectedUserID, identity.UserID)
	require.Equal(t, "user", identity.Role)
	accessClaims, _, err := service.parse(initial.AccessToken, typeAccess, service.accessSecret)
	require.NoError(t, err)
	require.NotEmpty(t, accessClaims.ID)
	require.Equal(t, "user", accessClaims.Role)
	refreshClaims, _, err := service.parse(initial.RefreshToken, typeRefresh, service.refreshSecret)
	require.NoError(t, err)
	require.Equal(t, refreshClaims.ID, refreshClaims.SessionID)
	require.NotEqual(t, accessClaims.ID, refreshClaims.ID)

	rotated, err := service.Refresh(ctx, initial.RefreshToken)
	require.NoError(t, err)
	require.NotEqual(t, initial.RefreshToken, rotated.RefreshToken)

	_, err = service.Authenticate(ctx, initial.AccessToken)
	require.ErrorIs(t, err, ErrInvalidToken)
	_, err = service.Refresh(ctx, initial.RefreshToken)
	require.ErrorIs(t, err, ErrInvalidToken)
	identity, err = service.Authenticate(ctx, rotated.AccessToken)
	require.NoError(t, err)
	require.Equal(t, expectedUserID, identity.UserID)
}

func TestLogoutInvalidatesSession(t *testing.T) {
	ctx := context.Background()
	service := testService(newMemorySessionStore())
	pair, err := service.Issue(ctx, uuid.New(), "user")
	require.NoError(t, err)

	require.NoError(t, service.Logout(ctx, pair.RefreshToken))
	require.NoError(t, service.Logout(ctx, pair.RefreshToken), "logout is idempotent for an already-revoked session")
	_, err = service.Authenticate(ctx, pair.AccessToken)
	require.ErrorIs(t, err, ErrInvalidToken)
	_, err = service.Refresh(ctx, pair.RefreshToken)
	require.ErrorIs(t, err, ErrInvalidToken)
}

func TestRejectsRefreshTokenAsAccessToken(t *testing.T) {
	ctx := context.Background()
	service := testService(newMemorySessionStore())
	pair, err := service.Issue(ctx, uuid.New(), "admin")
	require.NoError(t, err)

	_, err = service.Authenticate(ctx, pair.RefreshToken)
	require.ErrorIs(t, err, ErrInvalidToken)
}
