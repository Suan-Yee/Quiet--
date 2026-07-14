package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/suan-yee/Quiet/internal/token"
)

const currentIdentityKey = "current_identity"

type AccessTokenAuthenticator interface {
	Authenticate(ctx context.Context, rawAccessToken string) (token.Identity, error)
}

func RequireAuth(authenticator AccessTokenAuthenticator) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		parts := strings.Fields(ctx.GetHeader("Authorization"))
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			AbortWithError(ctx, NewAPIError(http.StatusUnauthorized, "Authentication required", nil, nil))
			return
		}
		identity, err := authenticator.Authenticate(ctx.Request.Context(), parts[1])
		if err != nil {
			if errors.Is(err, token.ErrInvalidToken) {
				AbortWithError(ctx, NewAPIError(http.StatusUnauthorized, "Access token is invalid or expired", nil, err))
			} else {
				AbortWithError(ctx, NewAPIError(http.StatusInternalServerError, "An unexpected error occurred", nil, err))
			}
			return
		}
		ctx.Set(currentIdentityKey, identity)
		ctx.Next()
	}
}

func RequireAdmin() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		identity, ok := CurrentIdentity(ctx)
		if !ok || identity.Role != "admin" {
			AbortWithError(ctx, NewAPIError(http.StatusForbidden, "Administrator access is required", nil, nil))
			return
		}
		ctx.Next()
	}
}

func CurrentIdentity(ctx *gin.Context) (token.Identity, bool) {
	value, exists := ctx.Get(currentIdentityKey)
	if !exists {
		return token.Identity{}, false
	}
	identity, ok := value.(token.Identity)
	return identity, ok
}

func CurrentUserID(ctx *gin.Context) (uuid.UUID, bool) {
	identity, ok := CurrentIdentity(ctx)
	return identity.UserID, ok
}
