package server

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/suan-yee/Quiet/internal/auth"
	"github.com/suan-yee/Quiet/internal/middleware"
	"github.com/suan-yee/Quiet/internal/token"
)

type fakeAuthenticator struct{}

func (fakeAuthenticator) Authenticate(context.Context, string) (token.Identity, error) {
	return token.Identity{UserID: uuid.New(), Role: "user"}, nil
}

func testRouter() *gin.Engine {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	return NewRouter(Dependencies{
		Environment: "test", Logger: logger, AllowedOrigins: []string{"http://localhost:5173"},
		AuthHandler: auth.NewHandler(nil), Authenticator: fakeAuthenticator{},
		RateLimiter: middleware.NewRateLimiter(nil, logger), Ready: func(context.Context) error { return nil },
	})
}

func TestHealthAndReadyEndpoints(t *testing.T) {
	router := testRouter()
	for _, path := range []string{"/health", "/ready"} {
		request := httptest.NewRequest(http.MethodGet, path, nil)
		response := httptest.NewRecorder()
		router.ServeHTTP(response, request)
		require.Equal(t, http.StatusOK, response.Code, path)
		require.Contains(t, response.Body.String(), `"success":true`)
	}
}

func TestAuthenticationRouteContract(t *testing.T) {
	routes := map[string]bool{}
	for _, route := range testRouter().Routes() {
		routes[route.Method+" "+route.Path] = true
	}
	for _, expected := range []string{
		"POST /api/v1/auth/signup",
		"POST /api/v1/auth/login",
		"POST /api/v1/auth/refresh",
		"POST /api/v1/auth/logout",
		"GET /api/v1/auth/me",
	} {
		require.True(t, routes[expected], expected)
	}
}
