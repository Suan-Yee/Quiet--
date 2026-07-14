package middleware

import (
	"crypto/rand"
	"encoding/hex"

	"github.com/gin-gonic/gin"
)

const (
	requestIDKey    = "request_id"
	requestIDHeader = "X-Request-ID"
)

func RequestIDMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		requestID := ctx.GetHeader(requestIDHeader)
		if requestID == "" || len(requestID) > 128 {
			requestID = newRequestID()
		}
		ctx.Set(requestIDKey, requestID)
		ctx.Header(requestIDHeader, requestID)
		ctx.Next()
	}
}

func RequestID(ctx *gin.Context) string {
	value, _ := ctx.Get(requestIDKey)
	requestID, _ := value.(string)
	return requestID
}

func newRequestID() string {
	value := make([]byte, 16)
	if _, err := rand.Read(value); err != nil {
		return "unknown"
	}
	return hex.EncodeToString(value)
}
