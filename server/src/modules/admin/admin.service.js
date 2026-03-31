const { prepare, executeTransaction } = require('../../config/database');
const { calculateMonthRanking } = require('../../utils/rankingCalculator');
const { buildChecklistProgressMap, invalidateRankingCache } = require('../ranking/ranking.service');

// Lock simples para evitar cálculos de ranking simultâneos para o mesmo mês
const rankingLocks = new Map();

async function listUsers({ page = 1, limit = 100 } = {}) {
  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const totalChecklist = totalRow.cnt;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const offset = (Math.max(1, page) - 1) * limit;

  const totalUsersRow = await prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'mentorada' AND deleted_at IS NULL").get();
  const totalUsers = totalUsersRow.cnt;

  const users = await prepare(`
    SELECT u.id, u.name, u.email, u.instagram_handle, u.profile_photo, u.role, u.created_at
    FROM users u WHERE u.role = 'mentorada' AND u.deleted_at IS NULL ORDER BY u.name ASC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const monthlyRows = await prepare('SELECT * FROM monthly_data WHERE month = ?').all(currentMonth);
  const monthlyMap = {};
  monthlyRows.forEach(r => { monthlyMap[r.user_id] = r; });

  const snapshots = await prepare(`
    SELECT rs.* FROM ranking_snapshots rs
    INNER JOIN (
      SELECT user_id, MAX(month) as max_month FROM ranking_snapshots GROUP BY user_id
    ) latest ON rs.user_id = latest.user_id AND rs.month = latest.max_month
  `).all();
  const snapshotMap = {};
  snapshots.forEach(s => { snapshotMap[s.user_id] = s; });

  // Uma query com GROUP BY em vez de N queries individuais
  const userIds = users.map(u => u.id);
  let completedMap = {};
  if (userIds.length > 0) {
    const placeholders = userIds.map(() => '?').join(',');
    const completedRows = await prepare(`
      SELECT user_id, COUNT(*) as cnt
      FROM checklist_progress
      WHERE user_id IN (${placeholders}) AND completed = 1
      GROUP BY user_id
    `).all(...userIds);
    completedMap = Object.fromEntries(completedRows.map(r => [r.user_id, r.cnt]));
  }

  const result = [];
  for (const u of users) {
    const checklist_completed = completedMap[u.id] || 0;
    const md = monthlyMap[u.id];
    const snap = snapshotMap[u.id];
    const checklistPct = totalChecklist > 0 ? Math.round((checklist_completed / totalChecklist) * 100) : 0;

    result.push({
      id: u.id,
      name: u.name,
      email: u.email,
      instagram_handle: u.instagram_handle,
      avatar_url: u.profile_photo ? `/uploads/${u.profile_photo}` : null,
      role: u.role,
      created_at: u.created_at,
      checklist_completed,
      checklist_total: totalChecklist,
      checklist_pct: checklistPct,
      followers_current: md?.followers_count ?? null,
      followers_previous: md?.followers_previous ?? null,
      followers_gained: md ? (md.followers_count || 0) - (md.followers_previous || 0) : null,
      revenue_current: md?.revenue ?? null,
      revenue_previous: md?.revenue_previous ?? null,
      revenue_growth_pct: (md?.revenue && md?.revenue_previous)
        ? Math.round(((md.revenue - md.revenue_previous) / md.revenue_previous) * 1000) / 10
        : null,
      score: snap?.total_score ?? null,
    });
  }
  return { data: result, total: totalUsers, page, limit };
}

async function updateUser(id, { name, email, instagram_handle, role }) {
  const existing = await prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
  if (!existing) {
    const err = new Error('Usuário não encontrado.'); err.status = 404; throw err;
  }
  const cleanName = name !== undefined && name !== null ? String(name).trim().slice(0, 100) : null;
  const cleanInsta = instagram_handle !== undefined && instagram_handle !== null
    ? String(instagram_handle).trim().replace(/^@/, '').slice(0, 50) : null;
  const cleanEmail = email !== undefined && email !== null ? String(email).trim().slice(0, 200) : null;
  await prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      instagram_handle = COALESCE(?, instagram_handle),
      role = COALESCE(?, role),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(cleanName, cleanEmail, cleanInsta, role ?? null, id);
  return prepare('SELECT id, name, email, instagram_handle, role, created_at FROM users WHERE id = ?').get(id);
}

async function deleteUser(id) {
  const existing = await prepare('SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
  if (!existing) {
    const err = new Error('Usuário não encontrado.'); err.status = 404; throw err;
  }
  if (existing.role === 'admin') {
    const err = new Error('Não é possível remover um administrador.'); err.status = 403; throw err;
  }
  await prepare("UPDATE users SET deleted_at = datetime('now') WHERE id = ?").run(id);
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action: 'delete_user', userId: id, details: { deletedRole: existing.role } }));
  return { success: true };
}

async function listChecklistItems() {
  return prepare('SELECT * FROM checklist_items ORDER BY sort_order ASC').all();
}

async function addChecklistItem({ stage, description, sort_order }) {
  if (!stage || !description) {
    const err = new Error('stage e description são obrigatórios.'); err.status = 400; throw err;
  }
  const cleanStage = String(stage).trim().slice(0, 100);
  const cleanDescription = String(description).trim().slice(0, 500);
  const result = await prepare(
    'INSERT INTO checklist_items (stage, description, sort_order, active) VALUES (?, ?, ?, 1)'
  ).run(cleanStage, cleanDescription, sort_order || 0);
  return prepare('SELECT * FROM checklist_items WHERE id = ?').get(result.lastInsertRowid);
}

async function updateChecklistItem(id, { stage, description, sort_order, active }) {
  const existing = await prepare('SELECT id FROM checklist_items WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Item não encontrado.'); err.status = 404; throw err;
  }
  await prepare(`
    UPDATE checklist_items SET
      stage = COALESCE(?, stage),
      description = COALESCE(?, description),
      sort_order = COALESCE(?, sort_order),
      active = COALESCE(?, active)
    WHERE id = ?
  `).run(stage ?? null, description ?? null, sort_order ?? null, active ?? null, id);
  return prepare('SELECT * FROM checklist_items WHERE id = ?').get(id);
}

async function deleteChecklistItem(id) {
  const existing = await prepare('SELECT id FROM checklist_items WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Item não encontrado.'); err.status = 404; throw err;
  }
  const progressRow = await prepare(
    'SELECT COUNT(*) as cnt FROM checklist_progress WHERE checklist_item_id = ? AND completed = 1'
  ).get(id);
  if (progressRow.cnt > 0) {
    const err = new Error('Não é possível remover item com progresso registrado.');
    err.status = 409;
    throw err;
  }
  await prepare('DELETE FROM checklist_items WHERE id = ?').run(id);
  return { success: true };
}

async function listPendingValidations(month, { page = 1, limit = 50 } = {}) {
  const currentMonth = month || new Date().toISOString().slice(0, 7);
  const offset = (Math.max(1, page) - 1) * limit;
  const rows = await prepare(`
    SELECT md.*, u.name, u.email, u.instagram_handle,
           u.profile_photo
    FROM monthly_data md
    JOIN users u ON u.id = md.user_id
    WHERE md.validated_by_admin = 0 AND md.month = ?
    ORDER BY md.created_at DESC
    LIMIT ? OFFSET ?
  `).all(currentMonth, limit, offset);
  const totalRow = await prepare(
    'SELECT COUNT(*) as cnt FROM monthly_data WHERE validated_by_admin = 0 AND month = ?'
  ).get(currentMonth);
  return { data: rows, total: totalRow.cnt, page, limit };
}

async function getMonthDiagnostic(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.'); err.status = 400; throw err;
  }
  const allData = await prepare(`
    SELECT md.id, md.user_id, md.month, md.followers_count, md.followers_previous,
           md.revenue, md.revenue_previous, md.validated_by_admin, md.created_at,
           u.name, u.instagram_handle
    FROM monthly_data md
    JOIN users u ON u.id = md.user_id AND u.role != 'admin'
    WHERE md.month = ?
    ORDER BY md.created_at DESC
  `).all(month);

  const snapshots = await prepare(
    'SELECT user_id, total_score, position FROM ranking_snapshots WHERE month = ? ORDER BY position ASC'
  ).all(month);

  const validated = allData.filter(r => r.validated_by_admin === 1);
  const pending   = allData.filter(r => r.validated_by_admin === 0);

  return {
    month,
    monthly_data: { total: allData.length, validated: validated.length, pending: pending.length, rows: allData },
    snapshots: { total: snapshots.length, rows: snapshots },
  };
}

async function approveAllPending(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido.'); err.status = 400; throw err;
  }
  const result = await prepare(
    'UPDATE monthly_data SET validated_by_admin = 1, updated_at = CURRENT_TIMESTAMP WHERE month = ? AND validated_by_admin = 0'
  ).run(month);
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action: 'approve_all_monthly', userId: null, details: { month, approved: result.changes } }));
  return { approved: result.changes };
}

async function setValidation(id, approved) {
  const existing = await prepare('SELECT id, month FROM monthly_data WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Registro não encontrado.'); err.status = 404; throw err;
  }
  const validated = approved ? 1 : 0;
  await prepare('UPDATE monthly_data SET validated_by_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(validated, id);

  // Não recalcula ranking aqui para evitar N recalculações em aprovações individuais.
  // O ranking deve ser recalculado manualmente via POST /admin/ranking/calculate
  // ou automaticamente após approveAllPending.

  return prepare('SELECT * FROM monthly_data WHERE id = ?').get(id);
}

async function listAllPrizes() {
  return prepare('SELECT * FROM prizes ORDER BY position ASC').all();
}

async function updatePrize(id, { title, description, active }) {
  const existing = await prepare('SELECT id FROM prizes WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Prêmio não encontrado.'); err.status = 404; throw err;
  }
  await prepare(`
    UPDATE prizes SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      active = COALESCE(?, active)
    WHERE id = ?
  `).run(title ?? null, description ?? null, active ?? null, id);
  return prepare('SELECT * FROM prizes WHERE id = ?').get(id);
}

async function calculateAndSaveRanking(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.'); err.status = 400; throw err;
  }

  if (rankingLocks.get(month)) {
    const err = new Error(`Cálculo de ranking para ${month} já está em andamento.`); err.status = 409; throw err;
  }
  rankingLocks.set(month, true);

  try {
  const allMonthlyData = await prepare(`
    SELECT md.* FROM monthly_data md
    JOIN users u ON u.id = md.user_id AND u.role != 'admin'
    WHERE md.month = ? AND md.validated_by_admin = 1
  `).all(month);
  const userIds = allMonthlyData.map(d => d.user_id);

  if (userIds.length === 0) {
    return { message: 'Nenhum dado encontrado para este mês.', count: 0 };
  }

  const checklistProgress = await buildChecklistProgressMap(userIds);
  const settings = await getSettings();
  const weights = settings?.ranking_weights || undefined;
  const scores = calculateMonthRanking(allMonthlyData, checklistProgress, weights);

  const insertSql = `INSERT INTO ranking_snapshots (user_id, month, checklist_score, revenue_score, followers_score, total_score, position) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await executeTransaction([
    { sql: 'DELETE FROM ranking_snapshots WHERE month = ?', args: [month] },
    ...scores.map(s => ({ sql: insertSql, args: [s.user_id, month, s.checklist_score, s.revenue_score, s.followers_score, s.total_score, s.position] })),
  ]);

  invalidateRankingCache(month);
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action: 'calculate_ranking', userId: null, details: { month, count: scores.length } }));
  return { message: 'Ranking calculado e salvo.', count: scores.length };
  } finally {
    rankingLocks.delete(month);
  }
}

async function exportCSV() {
  const users = await prepare(`
    SELECT u.id, u.name, u.email, u.instagram_handle
    FROM users u WHERE u.role = 'mentorada' AND u.deleted_at IS NULL ORDER BY u.name
  `).all();

  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const total = totalRow.cnt;

  // Busca todos os dados em batch para evitar N+1
  const exportUserIds = users.map(u => u.id);
  let exportCompletedMap = {};
  let exportSnapshotMap = {};
  if (exportUserIds.length > 0) {
    const ph = exportUserIds.map(() => '?').join(',');
    const completedRows = await prepare(`
      SELECT user_id, COUNT(*) as cnt FROM checklist_progress
      WHERE user_id IN (${ph}) AND completed = 1 GROUP BY user_id
    `).all(...exportUserIds);
    exportCompletedMap = Object.fromEntries(completedRows.map(r => [r.user_id, r.cnt]));

    const snapRows = await prepare(`
      SELECT rs.* FROM ranking_snapshots rs
      INNER JOIN (
        SELECT user_id, MAX(month) as max_month FROM ranking_snapshots
        WHERE user_id IN (${ph}) GROUP BY user_id
      ) latest ON rs.user_id = latest.user_id AND rs.month = latest.max_month
    `).all(...exportUserIds);
    exportSnapshotMap = Object.fromEntries(snapRows.map(r => [r.user_id, r]));
  }

  const rows = [];
  for (const u of users) {
    const completed = exportCompletedMap[u.id] || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const latestSnapshot = exportSnapshotMap[u.id] || null;

    rows.push({
      name: u.name,
      email: u.email,
      instagram_handle: u.instagram_handle || '',
      checklist_completed: completed,
      checklist_total: total,
      checklist_percentage: percentage,
      last_month: latestSnapshot ? latestSnapshot.month : '',
      checklist_score: latestSnapshot ? latestSnapshot.checklist_score : '',
      followers_score: latestSnapshot ? latestSnapshot.followers_score : '',
      total_score: latestSnapshot ? latestSnapshot.total_score : '',
      position: latestSnapshot ? latestSnapshot.position : '',
    });
  }

  const headers = ['Nome', 'E-mail', 'Instagram', 'Checklist Concluídos', 'Total Itens',
    '% Checklist', 'Último Mês', 'Score Checklist', 'Score Seguidores', 'Score Total', 'Posição'];

  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csvLines = [
    headers.join(','),
    ...rows.map(r => [
      esc(r.name), esc(r.email), esc(r.instagram_handle),
      r.checklist_completed, r.checklist_total, r.checklist_percentage,
      esc(r.last_month), r.checklist_score, r.followers_score,
      r.total_score, r.position
    ].join(','))
  ];

  return csvLines.join('\n');
}

const SETTINGS_DEFAULTS = {
  ranking_weights: { checklist: 0.34, revenue: 0.33, followers: 0.33 },
  max_revenue_score: 100,
};

async function getSettings() {
  try {
    const row = await prepare("SELECT value FROM app_settings WHERE key = 'config'").get();
    if (row) return JSON.parse(row.value);
  } catch (err) {
    console.error('[getSettings] Erro ao ler configurações:', err.message);
  }
  return SETTINGS_DEFAULTS;
}

async function updateSettings(newSettings) {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };
  await prepare(`
    INSERT INTO app_settings (key, value) VALUES ('config', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(JSON.stringify(merged));
  return merged;
}

module.exports = {
  listUsers, updateUser, deleteUser,
  listChecklistItems, addChecklistItem, updateChecklistItem, deleteChecklistItem,
  listPendingValidations, setValidation, approveAllPending,
  listAllPrizes, updatePrize,
  calculateAndSaveRanking,
  exportCSV,
  getSettings, updateSettings,
  getMonthDiagnostic,
};
