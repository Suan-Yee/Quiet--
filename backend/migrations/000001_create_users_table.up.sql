CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash TEXT NOT NULL,
    profile_image TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    author_description VARCHAR(240) NOT NULL DEFAULT '',
    role VARCHAR(16) NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_role_valid CHECK (role IN ('user', 'admin'))
);

CREATE UNIQUE INDEX users_username_unique_lower ON users (LOWER(username));
CREATE UNIQUE INDEX users_email_unique_lower ON users (LOWER(email));
CREATE INDEX users_active_index ON users (is_active) WHERE is_active = TRUE;
CREATE INDEX users_created_at_index ON users (created_at DESC);
