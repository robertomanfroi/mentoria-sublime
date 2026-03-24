-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_monthly_data_month ON monthly_data(month);
CREATE INDEX IF NOT EXISTS idx_monthly_data_user_month ON monthly_data(user_id, month);
CREATE INDEX IF NOT EXISTS idx_checklist_progress_user ON checklist_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_progress_user_completed ON checklist_progress(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_month ON ranking_snapshots(month);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_user_month ON ranking_snapshots(user_id, month);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
