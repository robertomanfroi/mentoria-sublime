ALTER TABLE monthly_data ADD COLUMN rejection_reason TEXT;
ALTER TABLE monthly_data ADD COLUMN validated_at DATETIME;
ALTER TABLE monthly_data ADD COLUMN validated_by INTEGER REFERENCES users(id);
