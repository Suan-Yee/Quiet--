package server

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/suan-yee/Quiet/internal/auth"
	"github.com/suan-yee/Quiet/internal/middleware"
)

type Dependencies struct {
	Environment    string
	Logger         *slog.Logger
	AllowedOrigins []string
	AuthHandler    *auth.Handler
	Authenticator  middleware.AccessTokenAuthenticator
	RateLimiter    *middleware.RateLimiter
	Ready          func(context.Context) error
}

func NewRouter(deps Dependencies) *gin.Engine {
	if deps.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()
	_ = router.SetTrustedProxies(nil)
	router.Use(
		middleware.RequestIDMiddleware(),
		middleware.StructuredLogger(deps.Logger),
		middleware.Recovery(deps.Logger),
		middleware.ErrorHandler(deps.Logger),
		middleware.SecureHeaders(),
		middleware.CORS(deps.AllowedOrigins),
	)
	router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "Service is healthy"})
	})
	router.GET("/ready", func(ctx *gin.Context) {
		checkCtx, cancel := context.WithTimeout(ctx.Request.Context(), 2*time.Second)
		defer cancel()
		if err := deps.Ready(checkCtx); err != nil {
			middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusServiceUnavailable, "Service is not ready", nil, err))
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "Service is ready"})
	})

	api := router.Group("/api/v1")
	api.Use(middleware.BodyLimit(1 << 20))
	auth.RegisterRoutes(
		api,
		deps.AuthHandler,
		deps.Authenticator,
		deps.RateLimiter.Limit("signup", 5, time.Hour),
		deps.RateLimiter.Limit("login", 10, 15*time.Minute),
	)
	return router
}
