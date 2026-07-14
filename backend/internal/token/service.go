package token

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/suan-yee/Quiet/internal/config"
)

var (
	ErrInvalidToken    = errors.New("invalid token")
	ErrSessionNotFound = errors.New("session not found")
)

const (
	typeAccess  = "access"
	typeRefresh = "refresh"
)

type Identity struct {
	UserID uuid.UUID
	Role   string
}

type SessionStore interface {
	Create(ctx context.Context, tokenID string, userID uuid.UUID, ttl time.Duration) error
	GetUserID(ctx context.Context, tokenID string) (uuid.UUID, error)
	Rotate(ctx context.Context, oldTokenID, newTokenID string, userID uuid.UUID, ttl time.Duration) error
	Delete(ctx context.Context, tokenID string) error
}

type Pair struct {
	AccessToken      string    `json:"accessToken"`
	RefreshToken     string    `json:"refreshToken"`
	TokenType        string    `json:"tokenType"`
	AccessExpiresAt  time.Time `json:"accessExpiresAt"`
	RefreshExpiresAt time.Time `json:"refreshExpiresAt"`
}

type Claims struct {
	TokenType string `json:"token_type"`
	Role      string `json:"role"`
	SessionID string `json:"sid"`
	jwt.RegisteredClaims
}

type Service struct {
	store         SessionStore
	accessSecret  []byte
	refreshSecret []byte
	issuer        string
	audience      string
	accessTTL     time.Duration
	refreshTTL    time.Duration
	now           func() time.Time
}

func NewService(store SessionStore, cfg config.JWTConfig) *Service {
	return &Service{
		store: store, accessSecret: []byte(cfg.AccessSecret), refreshSecret: []byte(cfg.RefreshSecret),
		issuer: cfg.Issuer, audience: cfg.Audience, accessTTL: cfg.AccessTTL, refreshTTL: cfg.RefreshTTL,
		now: time.Now,
	}
}

func (s *Service) Issue(ctx context.Context, userID uuid.UUID, role string) (Pair, error) {
	refreshID, err := randomID()
	if err != nil {
		return Pair{}, err
	}
	if err := s.store.Create(ctx, refreshID, userID, s.refreshTTL); err != nil {
		return Pair{}, fmt.Errorf("create refresh session: %w", err)
	}
	pair, err := s.signPair(userID, role, refreshID)
	if err != nil {
		_ = s.store.Delete(ctx, refreshID)
		return Pair{}, err
	}
	return pair, nil
}

func (s *Service) Refresh(ctx context.Context, rawRefreshToken string) (Pair, error) {
	claims, identity, err := s.parse(rawRefreshToken, typeRefresh, s.refreshSecret)
	if err != nil || claims.ID != claims.SessionID {
		return Pair{}, ErrInvalidToken
	}
	newRefreshID, err := randomID()
	if err != nil {
		return Pair{}, err
	}
	if err := s.store.Rotate(ctx, claims.ID, newRefreshID, identity.UserID, s.refreshTTL); err != nil {
		if errors.Is(err, ErrSessionNotFound) {
			return Pair{}, ErrInvalidToken
		}
		return Pair{}, fmt.Errorf("rotate refresh session: %w", err)
	}
	pair, err := s.signPair(identity.UserID, identity.Role, newRefreshID)
	if err != nil {
		_ = s.store.Delete(ctx, newRefreshID)
		return Pair{}, err
	}
	return pair, nil
}

func (s *Service) Authenticate(ctx context.Context, rawAccessToken string) (Identity, error) {
	claims, identity, err := s.parse(rawAccessToken, typeAccess, s.accessSecret)
	if err != nil {
		return Identity{}, ErrInvalidToken
	}
	storedUserID, err := s.store.GetUserID(ctx, claims.SessionID)
	if err != nil {
		if errors.Is(err, ErrSessionNotFound) {
			return Identity{}, ErrInvalidToken
		}
		return Identity{}, fmt.Errorf("get refresh session: %w", err)
	}
	if storedUserID != identity.UserID {
		return Identity{}, ErrInvalidToken
	}
	return identity, nil
}

func (s *Service) Logout(ctx context.Context, rawRefreshToken string) error {
	claims, _, err := s.parse(rawRefreshToken, typeRefresh, s.refreshSecret)
	if err != nil || claims.ID != claims.SessionID {
		return ErrInvalidToken
	}
	if err := s.store.Delete(ctx, claims.ID); err != nil {
		return fmt.Errorf("delete refresh session: %w", err)
	}
	return nil
}

func (s *Service) signPair(userID uuid.UUID, role, refreshID string) (Pair, error) {
	now := s.now().UTC()
	accessExpiresAt, refreshExpiresAt := now.Add(s.accessTTL), now.Add(s.refreshTTL)
	accessID, err := randomID()
	if err != nil {
		return Pair{}, err
	}
	accessToken, err := s.sign(userID, role, accessID, refreshID, typeAccess, now, accessExpiresAt, s.accessSecret)
	if err != nil {
		return Pair{}, err
	}
	refreshToken, err := s.sign(userID, role, refreshID, refreshID, typeRefresh, now, refreshExpiresAt, s.refreshSecret)
	if err != nil {
		return Pair{}, err
	}
	return Pair{AccessToken: accessToken, RefreshToken: refreshToken, TokenType: "Bearer", AccessExpiresAt: accessExpiresAt, RefreshExpiresAt: refreshExpiresAt}, nil
}

func (s *Service) sign(userID uuid.UUID, role, tokenID, sessionID, tokenType string, issuedAt, expiresAt time.Time, secret []byte) (string, error) {
	claims := Claims{
		TokenType: tokenType,
		Role:      role,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer: s.issuer, Subject: userID.String(), Audience: jwt.ClaimStrings{s.audience}, ID: tokenID,
			ExpiresAt: jwt.NewNumericDate(expiresAt), NotBefore: jwt.NewNumericDate(issuedAt), IssuedAt: jwt.NewNumericDate(issuedAt),
		},
	}
	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
	if err != nil {
		return "", fmt.Errorf("sign %s token: %w", tokenType, err)
	}
	return signed, nil
}

func (s *Service) parse(rawToken, expectedType string, secret []byte) (*Claims, Identity, error) {
	claims := &Claims{}
	parsed, err := jwt.ParseWithClaims(rawToken, claims, func(parsedToken *jwt.Token) (any, error) {
		if parsedToken.Method != jwt.SigningMethodHS256 {
			return nil, ErrInvalidToken
		}
		return secret, nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}), jwt.WithIssuer(s.issuer), jwt.WithAudience(s.audience), jwt.WithExpirationRequired(), jwt.WithIssuedAt())
	if err != nil || !parsed.Valid || claims.TokenType != expectedType || claims.ID == "" || claims.SessionID == "" || claims.Role == "" {
		return nil, Identity{}, ErrInvalidToken
	}
	userID, err := uuid.Parse(claims.Subject)
	if err != nil || userID == uuid.Nil {
		return nil, Identity{}, ErrInvalidToken
	}
	return claims, Identity{UserID: userID, Role: claims.Role}, nil
}

func randomID() (string, error) {
	value := make([]byte, 32)
	if _, err := rand.Read(value); err != nil {
		return "", fmt.Errorf("generate token id: %w", err)
	}
	return hex.EncodeToString(value), nil
}
