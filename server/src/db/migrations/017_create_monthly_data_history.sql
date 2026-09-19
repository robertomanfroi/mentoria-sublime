-- Versões anteriores de monthly_data: nada do que a mentorada preencheu é perdido
CREATE TABLE IF NOT EXISTS monthly_data_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monthly_data_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  followers_count INTEGER,
  followers_previous INTEGER,
  revenue REAL,
  revenue_previous REAL,
  revenue_last_year REAL,
  instagram_proof_image TEXT,
  validated_by_admin INTEGER,
  rejection_reason TEXT,
  yoy_status TEXT,
  reason TEXT NOT NULL,
  archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_monthly_data_history_user_month ON monthly_data_history(user_id, month)
