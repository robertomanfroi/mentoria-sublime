CREATE TABLE IF NOT EXISTS ranking_snapshots_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  checklist_score REAL DEFAULT 0,
  revenue_score REAL DEFAULT 0,
  followers_score REAL DEFAULT 0,
  total_score REAL DEFAULT 0,
  position INTEGER,
  archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ranking_history_month ON ranking_snapshots_history(month);
