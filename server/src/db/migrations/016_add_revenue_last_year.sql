-- Faturamento do mesmo mês do ano anterior (base do crescimento no ranking)
ALTER TABLE monthly_data ADD COLUMN revenue_last_year REAL;
-- Reabertura para completar o ano anterior: NULL | 'solicitado' | 'enviado'
ALTER TABLE monthly_data ADD COLUMN yoy_status TEXT;
-- Nota de checklist congelada no momento da reabertura (não reescreve meses passados)
ALTER TABLE monthly_data ADD COLUMN checklist_score_frozen REAL;
