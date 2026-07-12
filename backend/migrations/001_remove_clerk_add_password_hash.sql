-- Migration: Replace Clerk user mapping with local password authentication
-- Run this against your PostgreSQL/Supabase database before starting the updated backend.

ALTER TABLE users
    DROP COLUMN clerk_user_id,
    ADD COLUMN password_hash VARCHAR(255) NOT NULL;

DROP INDEX IF EXISTS idx_users_clerk_user_id;
