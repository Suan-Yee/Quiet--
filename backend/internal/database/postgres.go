package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/suan-yee/Quiet/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func OpenPostgres(cfg config.PostgresConfig, environment string) (*gorm.DB, error) {
	logMode := logger.Warn
	if environment == "development" {
		logMode = logger.Info
	}

	gormLogger := logger.New(log.New(os.Stdout, "", log.LstdFlags), logger.Config{
		SlowThreshold: time.Second, LogLevel: logMode, IgnoreRecordNotFoundError: true,
		ParameterizedQueries: true, Colorful: false,
	})
	db, err := gorm.Open(postgres.Open(cfg.ConnectionURL()), &gorm.Config{
		Logger:         gormLogger,
		TranslateError: true,
	})
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("get postgres connection pool: %w", err)
	}
	configurePool(sqlDB, cfg)
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	return db, nil
}

func configurePool(db *sql.DB, cfg config.PostgresConfig) {
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)
}
