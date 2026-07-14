package user

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID                uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name              string    `gorm:"size:120;not null"`
	Username          string    `gorm:"size:64;not null;uniqueIndex"`
	Email             string    `gorm:"size:320;not null;uniqueIndex"`
	PasswordHash      string    `gorm:"column:password_hash;not null"`
	ProfileImage      string    `gorm:"column:profile_image;type:text;not null;default:''"`
	CoverImage        string    `gorm:"column:cover_image;type:text;not null;default:''"`
	Bio               string    `gorm:"type:text;not null;default:''"`
	AuthorDescription string    `gorm:"column:author_description;size:240;not null;default:''"`
	Role              Role      `gorm:"type:varchar(16);not null;default:'user'"`
	IsActive          bool      `gorm:"column:is_active;not null;default:true"`
	CreatedAt         time.Time `gorm:"column:created_at;not null"`
	UpdatedAt         time.Time `gorm:"column:updated_at;not null"`
}

func (User) TableName() string { return "users" }
