package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/suan-yee/Quiet/internal/auth"
	"github.com/suan-yee/Quiet/internal/config"
	"github.com/suan-yee/Quiet/internal/database"
	"github.com/suan-yee/Quiet/internal/middleware"
	"github.com/suan-yee/Quiet/internal/server"
	"github.com/suan-yee/Quiet/internal/token"
	"github.com/suan-yee/Quiet/internal/user"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(logger); err != nil {
		logger.Error("api stopped", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	databaseURL := cfg.Postgres.ConnectionURL()
	if err := database.Migrate(databaseURL, cfg.Migrations); err != nil {
		return err
	}
	db, err := database.OpenPostgres(cfg.Postgres, cfg.Environment)
	if err != nil {
		return err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	defer sqlDB.Close()

	startupCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	redisClient, err := database.OpenRedis(startupCtx, cfg.Redis)
	if err != nil {
		return err
	}
	defer redisClient.Close()

	userRepository := user.NewRepository(db)
	sessionRepository := auth.NewSessionRepository(redisClient)
	tokenService := token.NewService(sessionRepository, cfg.JWT)
	authService := auth.NewService(userRepository, tokenService)
	authHandler := auth.NewHandler(authService)
	rateLimiter := middleware.NewRateLimiter(redisClient, logger)
	router := server.NewRouter(server.Dependencies{
		Environment:    cfg.Environment,
		Logger:         logger,
		AllowedOrigins: cfg.HTTP.AllowedOrigins,
		AuthHandler:    authHandler,
		Authenticator:  tokenService,
		RateLimiter:    rateLimiter,
		Ready: func(ctx context.Context) error {
			if err := sqlDB.PingContext(ctx); err != nil {
				return fmt.Errorf("postgres readiness: %w", err)
			}
			if err := redisClient.Ping(ctx).Err(); err != nil {
				return fmt.Errorf("redis readiness: %w", err)
			}
			return nil
		},
	})

	httpServer := &http.Server{
		Addr:         cfg.HTTP.Address,
		Handler:      router,
		ReadTimeout:  cfg.HTTP.ReadTimeout,
		WriteTimeout: cfg.HTTP.WriteTimeout,
		IdleTimeout:  cfg.HTTP.IdleTimeout,
	}
	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("api listening", "address", cfg.HTTP.Address, "environment", cfg.Environment)
		serverErrors <- httpServer.ListenAndServe()
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	select {
	case signalValue := <-stop:
		logger.Info("shutdown requested", "signal", signalValue.String())
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	return httpServer.Shutdown(shutdownCtx)
}
