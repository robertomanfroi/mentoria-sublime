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
       instagram_proof_image, validated_by_admin, created_at, updated_at
     FROM monthly_data WHERE user_id = ? ORDER BY month DESC`
  ).all(userId);
}

async function getByMonth(userId, month) {
  validateMonth(month);
  const row = await prepare(
    `SELECT id, user_id, month, followers_count, followers_previous,
       revenue, revenue_previous,
       instagram_proof_image, validated_by_admin, created_at, updated_at
     FROM monthly_data WHERE user_id = ? AND month = ?`
  ).get(userId, month);
  if (!row) {
    const err = new Error('Dados do mês não encontrados.');
    err.status = 404;
    throw err;
  }
  return row;
}

async function upsertMonth(userId, month, data) {
  validateMonth(month);
  const { followers_count, followers_previous, revenue, revenue_previous } = data;

  const existing = await prepare('SELECT id FROM monthly_data WHERE user_id = ? AND month = ?').get(userId, month);

  if (existing) {
    await prepare(`
      UPDATE monthly_data SET
        followers_count = COALESCE(?, followers_count),
        followers_previous = COALESCE(?, followers_previous),
        revenue = COALESCE(?, revenue),
        revenue_previous = COALESCE(?, revenue_previous),
        validated_by_admin = 0,
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
  const existing = await prepare('SELECT id FROM monthly_data WHERE user_id = ? AND month = ?').get(userId, month);
  if (!existing) {
    await prepare('INSERT INTO monthly_data (user_id, month) VALUES (?, ?)').run(userId, month);
  }
  await prepare(
    'UPDATE monthly_data SET instagram_proof_image = ?, validated_by_admin = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND month = ?'
  ).run(filename, userId, month);

  return prepare(
    `SELECT id, user_id, month, followers_count, followers_previous,
       instagram_proof_image, validated_by_admin, created_at, updated_at
     FROM monthly_data WHERE user_id = ? AND month = ?`
  ).get(userId, month);
}

module.exports = { getHistory, getByMonth, upsertMonth, updateProof };
