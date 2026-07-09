const { prepare } = require('../../config/database');

function validateMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }
}

async function getHistory(userId) {
  return prepare(
    `SELECT id, user_id, month, followers_count, followers_previous,
       instagram_proof_image, validated_by_admin, rejection_reason, created_at, updated_at
     FROM monthly_data WHERE user_id = ? ORDER BY month DESC`
  ).all(userId);
}

async function getByMonth(userId, month) {
  validateMonth(month);
  const row = await prepare(
    `SELECT id, user_id, month, followers_count, followers_previous,
       revenue, revenue_previous,
       instagram_proof_image, validated_by_admin, rejection_reason, created_at, updated_at
     FROM monthly_data WHERE user_id = ? AND month = ?`
  ).get(userId, month);
  return row || null;
}

function validateNumbers(data) {
  const fields = {
    followers_count: 'Seguidores (atual)',
    followers_previous: 'Seguidores (mês anterior)',
    revenue: 'Faturamento (atual)',
    revenue_previous: 'Faturamento (mês anterior)',
  };
  for (const [key, label] of Object.entries(fields)) {
    const value = data[key];
    if (value === undefined || value === null) continue;
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
      const err = new Error(`Valor inválido em "${label}". Use um número maior ou igual a zero.`);
      err.status = 400;
      throw err;
    }
  }
  const followers = Number(data.followers_count);
  if (!Number.isFinite(followers) || followers <= 0) {
    const err = new Error('Informe o número atual de seguidores para enviar os dados do mês.');
    err.status = 400;
    throw err;
  }
}

async function upsertMonth(userId, month, data) {
  validateMonth(month);
  validateNumbers(data);
  const { followers_count, followers_previous, revenue, revenue_previous } = data;

  const existing = await prepare('SELECT id, validated_by_admin FROM monthly_data WHERE user_id = ? AND month = ?').get(userId, month);

  if (existing && existing.validated_by_admin === 1) {
    const err = new Error('Este mês já foi validado pela mentora e não pode mais ser alterado. Fale com o suporte se precisar corrigir.');
    err.status = 409;
    throw err;
  }

  if (existing) {
    await prepare(`
      UPDATE monthly_data SET
        followers_count = COALESCE(?, followers_count),
        followers_previous = COALESCE(?, followers_previous),
        revenue = COALESCE(?, revenue),
        revenue_previous = COALESCE(?, revenue_previous),
        validated_by_admin = 0,
        rejection_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      followers_count ?? null,
      followers_previous ?? null,
      revenue ?? null,
      revenue_previous ?? null,
      existing.id
    );
  } else {
    await prepare(`
      INSERT INTO monthly_data (user_id, month, followers_count, followers_previous, revenue, revenue_previous)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, month, followers_count ?? null, followers_previous ?? null, revenue ?? null, revenue_previous ?? null);
  }

  return prepare('SELECT * FROM monthly_data WHERE user_id = ? AND month = ?').get(userId, month);
}

async function updateProof(userId, month, filename) {
  validateMonth(month);
  const existing = await prepare('SELECT id, validated_by_admin FROM monthly_data WHERE user_id = ? AND month = ?').get(userId, month);
  if (existing && existing.validated_by_admin === 1) {
    const err = new Error('Este mês já foi validado pela mentora e não pode mais ser alterado. Fale com o suporte se precisar corrigir.');
    err.status = 409;
    throw err;
  }
  if (!existing) {
    await prepare('INSERT INTO monthly_data (user_id, month) VALUES (?, ?)').run(userId, month);
  }
  await prepare(
    'UPDATE monthly_data SET instagram_proof_image = ?, validated_by_admin = 0, rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND month = ?'
  ).run(filename, userId, month);

  return prepare(
    `SELECT id, user_id, month, followers_count, followers_previous,
       instagram_proof_image, validated_by_admin, rejection_reason, created_at, updated_at
     FROM monthly_data WHERE user_id = ? AND month = ?`
  ).get(userId, month);
}

module.exports = { getHistory, getByMonth, upsertMonth, updateProof };
