package auth

import (
	"time"

	"github.com/suan-yee/Quiet/internal/token"
	"github.com/suan-yee/Quiet/internal/user"
)

type SignupRequest struct {
	Name            string `json:"name" binding:"required,min=1,max=120"`
	Email           string `json:"email" binding:"required,email,max=320"`
	Password        string `json:"password" binding:"required,min=8,max=72"`
	ConfirmPassword string `json:"confirmPassword" binding:"required,eqfield=Password"`
}

type RegisterRequest = SignupRequest

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email,max=320"`
	Password string `json:"password" binding:"required,max=72"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type RefreshRequest = RefreshTokenRequest
type LogoutRequest = RefreshTokenRequest

type AuthenticationResponse struct {
	User             user.Response `json:"user"`
	AccessToken      string        `json:"accessToken"`
	RefreshToken     string        `json:"refreshToken"`
	TokenType        string        `json:"tokenType"`
	AccessExpiresAt  time.Time     `json:"accessExpiresAt"`
	RefreshExpiresAt time.Time     `json:"refreshExpiresAt"`
}

func newAuthenticationResponse(value user.Response, pair token.Pair) AuthenticationResponse {
	return AuthenticationResponse{
		User: value, AccessToken: pair.AccessToken, RefreshToken: pair.RefreshToken, TokenType: pair.TokenType,
		AccessExpiresAt: pair.AccessExpiresAt, RefreshExpiresAt: pair.RefreshExpiresAt,
	}
}

type UserResponse struct {
	User user.Response `json:"user"`
}

type TokenResponse struct {
	AccessToken      string    `json:"accessToken"`
	RefreshToken     string    `json:"refreshToken"`
	TokenType        string    `json:"tokenType"`
	AccessExpiresAt  time.Time `json:"accessExpiresAt"`
	RefreshExpiresAt time.Time `json:"refreshExpiresAt"`
}

func newTokenResponse(pair token.Pair) TokenResponse {
	return TokenResponse{
		AccessToken: pair.AccessToken, RefreshToken: pair.RefreshToken, TokenType: pair.TokenType,
		AccessExpiresAt: pair.AccessExpiresAt, RefreshExpiresAt: pair.RefreshExpiresAt,
	}
}
