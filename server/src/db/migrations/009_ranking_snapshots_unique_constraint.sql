-- Migration 009: Adiciona UNIQUE constraint em ranking_snapshots (user_id, month)
-- Evita duplicatas ao recalcular o ranking do mesmo mês

CREATE UNIQUE INDEX IF NOT EXISTS idx_ranking_snapshots_user_month
  ON ranking_snapshots (user_id, month);
