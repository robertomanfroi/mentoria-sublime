CREATE TABLE IF NOT EXISTS ranking_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  checklist_score REAL DEFAULT 0,
  revenue_score REAL DEFAULT 0,
  followers_score REAL DEFAULT 0,
  total_score REAL DEFAULT 0,
  position INTEGER
);
