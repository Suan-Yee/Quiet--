package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type RateLimiter struct {
	client *redis.Client
	logger *slog.Logger
}

func NewRateLimiter(client *redis.Client, logger *slog.Logger) *RateLimiter {
	return &RateLimiter{client: client, logger: logger}
}

var rateLimitScript = redis.NewScript(`
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return {current, redis.call("PTTL", KEYS[1])}
`)

func (r *RateLimiter) Limit(name string, maximum int64, window time.Duration) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		count, ttl, err := r.increment(ctx.Request.Context(), name, ctx.ClientIP(), window)
		if err != nil {
			r.logger.Error("rate limiter unavailable", "error", err, "request_id", RequestID(ctx), "limit", name)
			ctx.Next()
			return
		}
		ctx.Header("X-RateLimit-Limit", strconv.FormatInt(maximum, 10))
		remaining := maximum - count
		if remaining < 0 {
			remaining = 0
		}
		ctx.Header("X-RateLimit-Remaining", strconv.FormatInt(remaining, 10))
		if count > maximum {
			retryAfter := int64(ttl.Seconds()) + 1
			ctx.Header("Retry-After", strconv.FormatInt(retryAfter, 10))
			AbortWithError(ctx, NewAPIError(http.StatusTooManyRequests, "Too many requests", map[string]string{"rateLimit": "Try again later"}, nil))
			return
		}
		ctx.Next()
	}
}

func (r *RateLimiter) increment(ctx context.Context, name, clientIP string, window time.Duration) (int64, time.Duration, error) {
	digest := sha256.Sum256([]byte(clientIP))
	key := "rate:" + name + ":" + hex.EncodeToString(digest[:16])
	values, err := rateLimitScript.Run(ctx, r.client, []string{key}, window.Milliseconds()).Slice()
	if err != nil {
		return 0, 0, err
	}
	count, err := strconv.ParseInt(fmt.Sprint(values[0]), 10, 64)
	if err != nil {
		return 0, 0, err
	}
	ttlMillis, err := strconv.ParseInt(fmt.Sprint(values[1]), 10, 64)
	if err != nil {
		return 0, 0, err
	}
	return count, time.Duration(ttlMillis) * time.Millisecond, nil
}
