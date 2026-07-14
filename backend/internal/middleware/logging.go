package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func StructuredLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		started := time.Now()
		ctx.Next()
		logger.Info("http request",
			"request_id", RequestID(ctx),
			"method", ctx.Request.Method,
			"path", ctx.FullPath(),
			"status", ctx.Writer.Status(),
			"duration_ms", time.Since(started).Milliseconds(),
			"client_ip", ctx.ClientIP(),
		)
	}
}

func Recovery(logger *slog.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if recovered := recover(); recovered != nil {
				logger.Error("panic recovered", "error", fmt.Sprint(recovered), "request_id", RequestID(ctx))
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, ErrorResponse{
					Success: false, Message: "An unexpected error occurred", RequestID: RequestID(ctx),
				})
			}
		}()
		ctx.Next()
	}
}
