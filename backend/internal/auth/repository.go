package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/suan-yee/Quiet/internal/token"
)

const sessionPrefix = "auth:refresh:"

type SessionRepository struct{ client *redis.Client }

func NewSessionRepository(client *redis.Client) *SessionRepository {
	return &SessionRepository{client: client}
}

func (r *SessionRepository) Create(ctx context.Context, tokenID string, userID uuid.UUID, ttl time.Duration) error {
	created, err := r.client.SetNX(ctx, sessionKey(tokenID), userID.String(), ttl).Result()
	if err != nil {
		return err
	}
	if !created {
		return errors.New("refresh token id collision")
	}
	return nil
}

func (r *SessionRepository) GetUserID(ctx context.Context, tokenID string) (uuid.UUID, error) {
	value, err := r.client.Get(ctx, sessionKey(tokenID)).Result()
	if errors.Is(err, redis.Nil) {
		return uuid.Nil, token.ErrSessionNotFound
	}
	if err != nil {
		return uuid.Nil, err
	}
	userID, err := uuid.Parse(value)
	if err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}

var rotateScript = redis.NewScript(`
local current = redis.call("GET", KEYS[1])
if not current or current ~= ARGV[1] or redis.call("EXISTS", KEYS[2]) == 1 then
  return 0
end
redis.call("SET", KEYS[2], ARGV[1], "PX", ARGV[2])
redis.call("DEL", KEYS[1])
return 1
`)

func (r *SessionRepository) Rotate(ctx context.Context, oldTokenID, newTokenID string, userID uuid.UUID, ttl time.Duration) error {
	rotated, err := rotateScript.Run(ctx, r.client, []string{sessionKey(oldTokenID), sessionKey(newTokenID)}, userID.String(), ttl.Milliseconds()).Int()
	if err != nil {
		return err
	}
	if rotated != 1 {
		return token.ErrSessionNotFound
	}
	return nil
}

func (r *SessionRepository) Delete(ctx context.Context, tokenID string) error {
	return r.client.Del(ctx, sessionKey(tokenID)).Err()
}

func sessionKey(tokenID string) string { return sessionPrefix + tokenID }
