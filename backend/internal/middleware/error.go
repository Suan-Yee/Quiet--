package middleware

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIError struct {
	Status  int
	Message string
	Details map[string]string
	Cause   error
}

type ErrorResponse struct {
	Success   bool              `json:"success"`
	Message   string            `json:"message"`
	Errors    map[string]string `json:"errors,omitempty"`
	RequestID string            `json:"requestId,omitempty"`
}

func (e *APIError) Error() string {
	if e.Cause != nil {
		return e.Cause.Error()
	}
	return e.Message
}

func NewAPIError(status int, message string, details map[string]string, cause error) *APIError {
	return &APIError{Status: status, Message: message, Details: details, Cause: cause}
}

func ErrorHandler(logger *slog.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()
		if len(ctx.Errors) == 0 || ctx.Writer.Written() {
			return
		}
		apiErr := &APIError{Status: http.StatusInternalServerError, Message: "An unexpected error occurred"}
		if !errors.As(ctx.Errors.Last().Err, &apiErr) {
			logger.Error("unhandled request error", "error", ctx.Errors.Last().Err, "request_id", RequestID(ctx))
		} else if apiErr.Status >= http.StatusInternalServerError {
			logger.Error("request failed", "error", apiErr.Cause, "request_id", RequestID(ctx))
		}
		ctx.JSON(apiErr.Status, ErrorResponse{Success: false, Message: apiErr.Message, Errors: apiErr.Details, RequestID: RequestID(ctx)})
	}
}

func AbortWithError(ctx *gin.Context, err error) {
	_ = ctx.Error(err)
	ctx.Abort()
}
