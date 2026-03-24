-- Triggers para manter updated_at atualizado automaticamente
-- WHEN garante que o trigger só dispara quando updated_at NÃO foi alterado explicitamente,
-- evitando loop recursivo em drivers SQLite/libsql
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN NEW.updated_at = OLD.updated_at
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
  END;

CREATE TRIGGER IF NOT EXISTS trg_monthly_data_updated_at
  AFTER UPDATE ON monthly_data
  FOR EACH ROW
  WHEN NEW.updated_at = OLD.updated_at
  BEGIN
    UPDATE monthly_data SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
  END;
