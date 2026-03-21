const db = require('../../config/database');
const { calculateMonthRanking } = require('../../utils/rankingCalculator');

function buildChecklistProgressMap(userIds) {
  const total = db.prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get().cnt;
  const map = {};

  for (const userId of userIds) {
    const completed = db.prepare(
      'SELECT COUNT(*) as cnt FROM checklist_progress WHERE user_id = ? AND completed = 1'
    ).get(userId).cnt;
    map[userId] = { completed, total };
  }

  return map;
}

function getRankingForMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }

  // Primeiro tenta retornar snapshot salvo
  const snapshots = db.prepare(`
    SELECT rs.*, u.name, u.instagram_handle, u.profile_photo
    FROM ranking_snapshots rs
    JOIN users u ON u.id = rs.user_id
    WHERE rs.month = ?
    ORDER BY rs.total_score DESC
  `).all(month);

  if (snapshots.length > 0) {
    return snapshots.map((s, i) => ({
      position: s.position || i + 1,
      user_id: s.user_id,
      name: s.name,
      instagram_handle: s.instagram_handle,
      avatar_url: s.profile_photo ? `/uploads/${s.profile_photo}` : null,
      checklist_score: s.checklist_score,
      followers_score: s.followers_score,
      total_score: s.total_score,
    }));
  }

  // Calcula ao vivo
  const allMonthlyData = db.prepare(
    'SELECT * FROM monthly_data WHERE month = ?'
  ).all(month);

  const userIds = allMonthlyData.map(d => d.user_id);
  if (userIds.length === 0) return [];

  const checklistProgress = buildChecklistProgressMap(userIds);
  const scores = calculateMonthRanking(allMonthlyData, checklistProgress);

  // Enriquecer com dados do usuário — single query (evita N+1)
  const scoreUserIds = scores.map(s => s.user_id);
  const placeholders = scoreUserIds.map(() => '?').join(',');
  const users = db.prepare(`SELECT id, name, instagram_handle, profile_photo FROM users WHERE id IN (${placeholders})`).all(...scoreUserIds);
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const result = scores.map((s, i) => {
    const user = userMap[s.user_id] || {};
    return {
      position: i + 1,
      user_id: s.user_id,
      name: user.name || null,
      instagram_handle: user.instagram_handle || null,
      avatar_url: user.profile_photo ? `/uploads/${user.profile_photo}` : null,
      checklist_score: s.checklist_score,
      followers_score: s.followers_score,
      total_score: s.total_score,
    };
  });

  return result;
}

function getMyPosition(userId, month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }

  const ranking = getRankingForMonth(month);
  const myEntry = ranking.find(r => r.user_id === userId);

  if (!myEntry) {
    return { position: null, scores: null, message: 'Dados não encontrados para este mês.' };
  }

  return myEntry;
}

module.exports = { getRankingForMonth, getMyPosition, buildChecklistProgressMap };
