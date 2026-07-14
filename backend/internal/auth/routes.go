package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/suan-yee/Quiet/internal/middleware"
)

func RegisterRoutes(api *gin.RouterGroup, handler *Handler, authenticator middleware.AccessTokenAuthenticator, signupLimit, loginLimit gin.HandlerFunc) {
	authRoutes := api.Group("/auth")
	authRoutes.POST("/signup", signupLimit, handler.Signup)
	authRoutes.POST("/login", loginLimit, handler.Login)
	authRoutes.POST("/refresh", handler.Refresh)
	authRoutes.POST("/logout", handler.Logout)
	authRoutes.GET("/me", middleware.RequireAuth(authenticator), handler.Me)
}
