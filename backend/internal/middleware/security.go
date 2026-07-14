package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func SecureHeaders() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("X-Content-Type-Options", "nosniff")
		ctx.Header("X-Frame-Options", "DENY")
		ctx.Header("Referrer-Policy", "no-referrer")
		ctx.Header("Cache-Control", "no-store")
		ctx.Next()
	}
}

func BodyLimit(maxBytes int64) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.Request.Body != nil {
			ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, maxBytes)
		}
		ctx.Next()
	}
}
