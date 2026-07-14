package user

import (
	"time"

	"github.com/google/uuid"
)

type Response struct {
	ID                uuid.UUID `json:"id"`
	Name              string    `json:"name"`
	Username          string    `json:"username"`
	Email             string    `json:"email"`
	ProfileImage      string    `json:"profileImage"`
	CoverImage        string    `json:"coverImage"`
	Bio               string    `json:"bio"`
	AuthorDescription string    `json:"authorDescription"`
	Role              Role      `json:"role"`
	IsActive          bool      `json:"isActive"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

func ToResponse(value *User) Response {
	return Response{
		ID:                value.ID,
		Name:              value.Name,
		Username:          value.Username,
		Email:             value.Email,
		ProfileImage:      value.ProfileImage,
		CoverImage:        value.CoverImage,
		Bio:               value.Bio,
		AuthorDescription: value.AuthorDescription,
		Role:              value.Role,
		IsActive:          value.IsActive,
		CreatedAt:         value.CreatedAt,
		UpdatedAt:         value.UpdatedAt,
	}
}
