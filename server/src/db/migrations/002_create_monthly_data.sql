CREATE TABLE IF NOT EXISTS monthly_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  followers_count INTEGER,
  followers_previous INTEGER,
  revenue REAL,
  revenue_previous REAL,
  instagram_proof_image TEXT,
  validated_by_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month)
);
