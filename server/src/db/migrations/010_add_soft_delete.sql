-- Soft delete para usuários
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
