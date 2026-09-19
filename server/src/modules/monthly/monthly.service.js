const { prepare } = require('../../config/database');

// Início da mentoria: meses anteriores não podem ser preenchidos nem entram no ranking
const { FIRST_MONTH } = require('../../utils/rankingCalculator');

function validateMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }
  if (month < FIRST_MONTH) {
    const err = new Error('A mentoria começou em novembro de 2025. Escolha um mês a partir dessa data.');
    err.status = 400;
    throw err;
  }
}

// Guarda a versão atual do registro antes de qualquer alteração
const ARCHIVE_SQL = `
  INSERT INTO monthly_data_history (monthly_data_id, user_id, month, followers_count, followers_previous,
    revenue, revenue_previous, revenue_last_year, instagram_proof_image, validated_by_admin,
    rejection_reason, yoy_status, reason)
  SELECT id, user_id, month, followers_count, followers_previous,
    revenue, revenue_previous, revenue_last_year, instagram_proof_image, validated_by_admin,
    rejection_reason, yoy_status, ?
  FROM monthly_data WHERE id = ?`;

async function archiveVersion(id, reason) {
  await prepare(ARCHIVE_SQL).run(reason, id);
}

// Mesmo mês do ano anterior: "2026-09" → "2025-09"
function sameMonthLastYear(month) {
  const [y, m] = month.split('-');
  return `${Number(y) - 1}-${m}`;
}

// Trava só na aprovação: enquanto a mentora não validar, a mentorada corrige quantas vezes precisar
function lockMessage(row) {
  if (!row) return null;
  if (row.yoy_status === 'solicitado') return null; // reaberto para correção
  if (row.validated_by_admin === 1) {
    return 'Este mês já foi validado pela mentora e não pode mais ser alterado. Fale com o suporte se precisar corrigir.';
  }
  return null;
}

async function getHistory(userId) {
  return prepare(
    `SELECT id, user_id, month, followers_count, followers_previous, revenue_last_year,
       instagram_proof_image, yoy_status, validated_by_admin, rejection_reason, created_at, updated_at
     FROM monthly_data WHERE user_id = ? ORDER BY month DESC`
  ).all(userId);
}

async function getByMonth(userId, month) {
  validateMonth(month);
  const row = await prepare(
    `SELECT id, user_id, month, followers_count, followers_previous,
       revenue, revenue_previous, revenue_last_year, yoy_status,
       instagram_proof_image, validated_by_admin, rejection_reason, created_at, updated_at
     FROM monthly_data WHERE user_id = ? AND month = ?`
  ).get(userId, month);

  // Sugestão: faturamento que ela mesma informou no mesmo mês do ano anterior
  const lastYear = await prepare(
    'SELECT revenue FROM monthly_data WHERE user_id = ? AND month = ? AND revenue IS NOT NULL'
  ).get(userId, sameMonthLastYear(month));
  const suggestion = lastYear ? lastYear.revenue : null;

  if (!row) return suggestion !== null ? { revenue_last_year_suggestion: suggestion } : null;
  return { ...row, revenue_last_year_suggestion: suggestion };
}

function validateNumbers(data) {
  const fields = {
    followers_count: 'Seguidores (atual)',
    followers_previous: 'Seguidores (mês anterior)',
    revenue: 'Faturamento (atual)',
    revenue_previous: 'Faturamento (mês anterior)',
    revenue_last_year: 'Faturamento (mesmo mês do ano anterior)',
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
  const { followers_count, followers_previous, revenue, revenue_previous, revenue_last_year } = data;

  const existing = await prepare(
    'SELECT id, validated_by_admin, yoy_status, revenue_last_year FROM monthly_data WHERE user_id = ? AND month = ?'
  ).get(userId, month);

  const locked = lockMessage(existing);
  if (locked) {
    const err = new Error(locked);
    err.status = 409;
    throw err;
  }

  const finalLastYear = revenue_last_year ?? existing?.revenue_last_year ?? null;
  if (finalLastYear === null || finalLastYear === '') {
    const err = new Error('Informe o faturamento do mesmo mês do ano anterior (use 0 se não faturou).');
    err.status = 400;
    throw err;
  }

  // Mês reaberto passa a 'enviado': volta para a fila da mentora, mas segue editável até a aprovação
  const nextYoyStatus = existing?.yoy_status ? 'enviado' : null;

  if (existing) {
    await archiveVersion(existing.id, 'edicao_dados');
    await prepare(`
      UPDATE monthly_data SET
        followers_count = COALESCE(?, followers_count),
        followers_previous = COALESCE(?, followers_previous),
        revenue = COALESCE(?, revenue),
        revenue_previous = COALESCE(?, revenue_previous),
        revenue_last_year = COALESCE(?, revenue_last_year),
        yoy_status = ?,
        validated_by_admin = 0,
        rejection_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      followers_count ?? null,
      followers_previous ?? null,
      revenue ?? null,
      revenue_previous ?? null,
      revenue_last_year ?? null,
      nextYoyStatus,
      existing.id
    );
  } else {
    await prepare(`
      INSERT INTO monthly_data (user_id, month, followers_count, followers_previous, revenue, revenue_previous, revenue_last_year)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, month, followers_count ?? null, followers_previous ?? null, revenue ?? null, revenue_previous ?? null, revenue_last_year ?? null);
  }

  return prepare('SELECT * FROM monthly_data WHERE user_id = ? AND month = ?').get(userId, month);
}

async function updateProof(userId, month, filename) {
  validateMonth(month);
  const existing = await prepare('SELECT id, validated_by_admin, yoy_status FROM monthly_data WHERE user_id = ? AND month = ?').get(userId, month);
  const locked = lockMessage(existing);
  if (locked) {
    const err = new Error(locked);
    err.status = 409;
    throw err;
  }
  if (!existing) {
    await prepare('INSERT INTO monthly_data (user_id, month) VALUES (?, ?)').run(userId, month);
  } else {
    await archiveVersion(existing.id, 'troca_print');
  }
  // Mesmo tratamento do envio de dados: mês reaberto volta para a fila da mentora
  const nextYoyStatus = existing?.yoy_status ? 'enviado' : null;
  await prepare(
    'UPDATE monthly_data SET instagram_proof_image = ?, yoy_status = ?, validated_by_admin = 0, rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND month = ?'
  ).run(filename, nextYoyStatus, userId, month);

  return prepare(
    `SELECT id, user_id, month, followers_count, followers_previous,
       instagram_proof_image, validated_by_admin, rejection_reason, created_at, updated_at
     FROM monthly_data WHERE user_id = ? AND month = ?`
  ).get(userId, month);
}

module.exports = { getHistory, getByMonth, upsertMonth, updateProof };
