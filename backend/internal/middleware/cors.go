package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS(allowedOrigins []string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		allowed[origin] = struct{}{}
	}
	return func(ctx *gin.Context) {
		origin := ctx.GetHeader("Origin")
		_, explicitlyAllowed := allowed[origin]
		if origin != "" && (explicitlyAllowed || containsWildcard(allowedOrigins)) {
			ctx.Header("Access-Control-Allow-Origin", origin)
			ctx.Header("Access-Control-Allow-Credentials", "true")
			ctx.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-ID")
			ctx.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			ctx.Header("Vary", "Origin")
		}
		if ctx.Request.Method == http.MethodOptions {
			if origin == "" {
				ctx.AbortWithStatus(http.StatusNoContent)
				return
			}
			if _, ok := allowed[origin]; !ok && !containsWildcard(allowedOrigins) {
				ctx.AbortWithStatus(http.StatusForbidden)
				return
			}
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}
		ctx.Next()
	}
}

func containsWildcard(origins []string) bool {
	for _, origin := range origins {
		if strings.TrimSpace(origin) == "*" {
			return true
		}
	}
	return false
}
