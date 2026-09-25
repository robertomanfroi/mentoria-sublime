-- Mês aprovado que o admin decidiu não contar no ranking (a mentorada continua vendo como aprovado)
ALTER TABLE monthly_data ADD COLUMN excluded_from_ranking INTEGER DEFAULT 0;
