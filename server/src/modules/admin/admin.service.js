const { prepare } = require('../../config/database');
const { calculateMonthRanking } = require('../../utils/rankingCalculator');
const { buildChecklistProgressMap } = require('../ranking/ranking.service');

async function listUsers() {
  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const totalChecklist = totalRow.cnt;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const users = await prepare(`
    SELECT u.id, u.name, u.email, u.instagram_handle, u.profile_photo, u.role, u.created_at
    FROM users u WHERE u.role = 'mentorada' ORDER BY u.name ASC
  `).all();

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

  const result = [];
  for (const u of users) {
    const completedRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_progress WHERE user_id = ? AND completed = 1').get(u.id);
    const checklist_completed = completedRow.cnt;
    const md = monthlyMap[u.id];
    const snap = snapshotMap[u.id];
    const checklistPct = totalChecklist > 0 ? Math.round((checklist_completed / totalChecklist) * 100) : 0;

    result.push({
      id: u.id,
      name: u.name,
      email: u.email,
      instagram: u.instagram_handle,
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
  return result;
}

async function updateUser(id, { name, email, instagram_handle, role }) {
  const existing = await prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Usuário não encontrado.'); err.status = 404; throw err;
  }
  await prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      instagram_handle = COALESCE(?, instagram_handle),
      role = COALESCE(?, role),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name ?? null, email ?? null, instagram_handle ?? null, role ?? null, id);
  return prepare('SELECT id, name, email, instagram_handle, role, created_at FROM users WHERE id = ?').get(id);
}

async function deleteUser(id) {
  const existing = await prepare('SELECT id, role FROM users WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Usuário não encontrado.'); err.status = 404; throw err;
  }
  if (existing.role === 'admin') {
    const err = new Error('Não é possível remover um administrador.'); err.status = 403; throw err;
  }
  await prepare('DELETE FROM users WHERE id = ?').run(id);
  return { success: true };
}

async function listChecklistItems() {
  return prepare('SELECT * FROM checklist_items ORDER BY sort_order ASC').all();
}

async function addChecklistItem({ stage, description, sort_order }) {
  if (!stage || !description) {
    const err = new Error('stage e description são obrigatórios.'); err.status = 400; throw err;
  }
  const result = await prepare(
    'INSERT INTO checklist_items (stage, description, sort_order, active) VALUES (?, ?, ?, 1)'
  ).run(stage, description, sort_order || 0);
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
  await prepare('DELETE FROM checklist_items WHERE id = ?').run(id);
  return { success: true };
}

async function listPendingValidations() {
  return prepare(`
    SELECT md.*, u.name, u.email, u.instagram_handle
    FROM monthly_data md
    JOIN users u ON u.id = md.user_id
    WHERE md.instagram_proof_image IS NOT NULL
    ORDER BY md.created_at DESC
  `).all();
}

async function setValidation(id, approved) {
  const existing = await prepare('SELECT id FROM monthly_data WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Registro não encontrado.'); err.status = 404; throw err;
  }
  const validated = approved ? 1 : 0;
  await prepare('UPDATE monthly_data SET validated_by_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(validated, id);
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

  const allMonthlyData = await prepare('SELECT * FROM monthly_data WHERE month = ?').all(month);
  const userIds = allMonthlyData.map(d => d.user_id);

  if (userIds.length === 0) {
    return { message: 'Nenhum dado encontrado para este mês.', count: 0 };
  }

  const checklistProgress = await buildChecklistProgressMap(userIds);
  const scores = calculateMonthRanking(allMonthlyData, checklistProgress);

  await prepare('DELETE FROM ranking_snapshots WHERE month = ?').run(month);

  for (let i = 0; i < scores.length; i++) {
    const s = scores[i];
    await prepare(`
      INSERT INTO ranking_snapshots (user_id, month, checklist_score, revenue_score, followers_score, total_score, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(s.user_id, month, s.checklist_score, s.revenue_score, s.followers_score, s.total_score, i + 1);
  }

  return { message: 'Ranking calculado e salvo.', count: scores.length };
}

async function exportCSV() {
  const users = await prepare(`
    SELECT u.id, u.name, u.email, u.instagram_handle
    FROM users u WHERE u.role = 'mentorada' ORDER BY u.name
  `).all();

  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const total = totalRow.cnt;

  const rows = [];
  for (const u of users) {
    const completedRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_progress WHERE user_id = ? AND completed = 1').get(u.id);
    const completed = completedRow.cnt;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const latestSnapshot = await prepare('SELECT * FROM ranking_snapshots WHERE user_id = ? ORDER BY month DESC LIMIT 1').get(u.id);

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

  const csvLines = [
    headers.join(','),
    ...rows.map(r => [
      `"${r.name}"`, `"${r.email}"`, `"${r.instagram_handle}"`,
      r.checklist_completed, r.checklist_total, r.checklist_percentage,
      `"${r.last_month}"`, r.checklist_score, r.followers_score,
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
  } catch (_) {}
  return SETTINGS_DEFAULTS;
}

async function updateSettings(newSettings) {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };
  try {
    await prepare(`
      INSERT INTO app_settings (key, value) VALUES ('config', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(JSON.stringify(merged));
  } catch (_) {}
  return merged;
}

module.exports = {
  listUsers, updateUser, deleteUser,
  listChecklistItems, addChecklistItem, updateChecklistItem, deleteChecklistItem,
  listPendingValidations, setValidation,
  listAllPrizes, updatePrize,
  calculateAndSaveRanking,
  exportCSV,
  getSettings, updateSettings,
};
