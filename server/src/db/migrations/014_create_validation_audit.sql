CREATE TABLE IF NOT EXISTS validation_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monthly_data_id INTEGER NOT NULL,
  user_id INTEGER,
  month TEXT,
  previous_status INTEGER,
  new_status INTEGER NOT NULL,
  previous_reason TEXT,
  new_reason TEXT,
  admin_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_validation_audit_monthly ON validation_audit(monthly_data_id);
