package main

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"time"

	"github.com/suan-yee/Quiet/internal/auth"
	"github.com/suan-yee/Quiet/internal/config"
	"github.com/suan-yee/Quiet/internal/database"
	"github.com/suan-yee/Quiet/internal/user"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	cfg, err := config.Load()
	if err != nil {
		logger.Error("load seed configuration", "error", err)
		os.Exit(1)
	}
	if cfg.Admin.Username == "" || cfg.Admin.Email == "" || cfg.Admin.Password == "" {
		logger.Error("seed initial admin", "error", errors.New("INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD are required"))
		os.Exit(1)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	databaseURL := cfg.Postgres.ConnectionURL()
	if err := database.Migrate(databaseURL, cfg.Migrations); err != nil {
		logger.Error("apply migrations", "error", err)
		os.Exit(1)
	}
	db, err := database.OpenPostgres(cfg.Postgres, cfg.Environment)
	if err != nil {
		logger.Error("open postgres", "error", err)
		os.Exit(1)
	}
	sqlDB, err := db.DB()
	if err != nil {
		logger.Error("get postgres pool", "error", err)
		os.Exit(1)
	}
	defer sqlDB.Close()

	service := auth.NewService(user.NewRepository(db), nil)
	created, err := service.BootstrapAdmin(ctx, cfg.Admin.Username, cfg.Admin.Email, cfg.Admin.Password)
	if err != nil {
		logger.Error("seed initial admin", "error", err)
		os.Exit(1)
	}
	if created {
		logger.Info("initial admin created", "email", cfg.Admin.Email, "username", cfg.Admin.Username)
		return
	}
	logger.Info("initial admin already exists", "email", cfg.Admin.Email, "username", cfg.Admin.Username)
}
