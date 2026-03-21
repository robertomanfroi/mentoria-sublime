const { prepare } = require('../../config/database');
const { calculateMonthRanking } = require('../../utils/rankingCalculator');

async function buildChecklistProgressMap(userIds) {
  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const total = totalRow.cnt;
  const map = {};

  for (const userId of userIds) {
    const row = await prepare(
      'SELECT COUNT(*) as cnt FROM checklist_progress WHERE user_id = ? AND completed = 1'
    ).get(userId);
    map[userId] = { completed: row.cnt, total };
  }

  return map;
}

async function getRankingForMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }

  const snapshots = await prepare(`
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

  const allMonthlyData = await prepare('SELECT * FROM monthly_data WHERE month = ?').all(month);
  const userIds = allMonthlyData.map(d => d.user_id);
  if (userIds.length === 0) return [];

  const checklistProgress = await buildChecklistProgressMap(userIds);
  const scores = calculateMonthRanking(allMonthlyData, checklistProgress);

  const scoreUserIds = scores.map(s => s.user_id);
  const placeholders = scoreUserIds.map(() => '?').join(',');
  const users = await prepare(`SELECT id, name, instagram_handle, profile_photo FROM users WHERE id IN (${placeholders})`).all(...scoreUserIds);
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  return scores.map((s, i) => {
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
}

async function getMyPosition(userId, month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }

  const ranking = await getRankingForMonth(month);
  const myEntry = ranking.find(r => r.user_id === userId);

  if (!myEntry) {
    return { position: null, scores: null, message: 'Dados não encontrados para este mês.' };
  }

  return myEntry;
}

module.exports = { getRankingForMonth, getMyPosition, buildChecklistProgressMap };
