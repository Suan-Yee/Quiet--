package auth

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/suan-yee/Quiet/internal/middleware"
)

type Handler struct{ service *Service }

type successResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (h *Handler) Signup(ctx *gin.Context) {
	var input SignupRequest
	if err := ctx.ShouldBindJSON(&input); err != nil {
		validationFailure(ctx, err)
		return
	}
	if !ValidPassword(input.Password) {
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusUnprocessableEntity, "Validation failed", map[string]string{
			"password": "Password must be 8-72 characters and include uppercase, lowercase, and a number",
		}, nil))
		return
	}
	response, err := h.service.Register(ctx.Request.Context(), input)
	if err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, successResponse{Success: true, Message: "Account created successfully", Data: response})
}

func (h *Handler) Login(ctx *gin.Context) {
	var input LoginRequest
	if err := ctx.ShouldBindJSON(&input); err != nil {
		validationFailure(ctx, err)
		return
	}
	response, err := h.service.Login(ctx.Request.Context(), input)
	if err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, successResponse{Success: true, Message: "Login successful", Data: response})
}

func (h *Handler) Refresh(ctx *gin.Context) {
	var input RefreshTokenRequest
	if err := ctx.ShouldBindJSON(&input); err != nil {
		validationFailure(ctx, err)
		return
	}
	response, err := h.service.Refresh(ctx.Request.Context(), input.RefreshToken)
	if err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, successResponse{Success: true, Message: "Tokens refreshed successfully", Data: response})
}

func (h *Handler) Logout(ctx *gin.Context) {
	var input LogoutRequest
	if err := ctx.ShouldBindJSON(&input); err != nil {
		validationFailure(ctx, err)
		return
	}
	if err := h.service.Logout(ctx.Request.Context(), input.RefreshToken); err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, successResponse{Success: true, Message: "Logout successful"})
}

func (h *Handler) Me(ctx *gin.Context) {
	userID, ok := middleware.CurrentUserID(ctx)
	if !ok {
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusUnauthorized, "Authentication required", nil, nil))
		return
	}
	response, err := h.service.CurrentUser(ctx.Request.Context(), userID)
	if err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, successResponse{Success: true, Message: "Current user retrieved", Data: response})
}

func validationFailure(ctx *gin.Context, err error) {
	var maxBytesError *http.MaxBytesError
	if errors.As(err, &maxBytesError) {
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusRequestEntityTooLarge, "Request body is too large", nil, err))
		return
	}
	details := map[string]string{"request": "Request body is invalid"}
	var fieldErrors validator.ValidationErrors
	if errors.As(err, &fieldErrors) {
		details = make(map[string]string, len(fieldErrors))
		for _, fieldError := range fieldErrors {
			field := lowerFirst(fieldError.Field())
			switch fieldError.Tag() {
			case "required":
				details[field] = "This field is required"
			case "email":
				details[field] = "A valid email is required"
			case "min":
				details[field] = "This value is too short"
			case "max":
				details[field] = "This value is too long"
			case "eqfield":
				details[field] = "Must match password"
			default:
				details[field] = "This field is invalid"
			}
		}
	}
	middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusUnprocessableEntity, "Validation failed", details, err))
}

func handleServiceError(ctx *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrEmailInUse):
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusConflict, "Account already exists", map[string]string{"email": "Email is already registered"}, err))
	case errors.Is(err, ErrInvalidCredentials):
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusUnauthorized, "Invalid email or password", nil, err))
	case errors.Is(err, ErrInactiveUser):
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusForbidden, "User account is inactive", nil, err))
	case errors.Is(err, ErrUnauthorized):
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusUnauthorized, "Token is invalid or expired", nil, err))
	case errors.Is(err, ErrInvalidInput):
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusUnprocessableEntity, "Validation failed", nil, err))
	default:
		middleware.AbortWithError(ctx, middleware.NewAPIError(http.StatusInternalServerError, "An unexpected error occurred", nil, err))
	}
}

func lowerFirst(value string) string {
	if value == "" {
		return value
	}
	return strings.ToLower(value[:1]) + value[1:]
}
