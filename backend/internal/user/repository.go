package user

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrNotFound  = errors.New("user not found")
	ErrDuplicate = errors.New("user already exists")
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, value *User) error {
	if err := r.db.WithContext(ctx).Create(value).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrDuplicate
		}
		return err
	}
	return nil
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (*User, error) {
	var value User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&value).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &value, err
}

func (r *Repository) FindByID(ctx context.Context, id uuid.UUID) (*User, error) {
	var value User
	err := r.db.WithContext(ctx).First(&value, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &value, err
}

func (r *Repository) FindByUsername(ctx context.Context, username string) (*User, error) {
	var value User
	err := r.db.WithContext(ctx).Where("LOWER(username) = LOWER(?)", username).First(&value).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &value, err
}

func (r *Repository) UsernameExists(ctx context.Context, username string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&User{}).Where("username = ?", username).Count(&count).Error
	return count > 0, err
}
