const { prepare } = require('../../config/database');
const { calculateMonthRanking } = require('../../utils/rankingCalculator');

async function buildChecklistProgressMap(userIds) {
  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const total = totalRow.cnt;

  if (userIds.length === 0) return {};

  // Uma única query com GROUP BY em vez de N queries individuais
  const placeholders = userIds.map(() => '?').join(',');
  const rows = await prepare(`
    SELECT user_id, COUNT(*) as completed
    FROM checklist_progress
    WHERE user_id IN (${placeholders}) AND completed = 1
    GROUP BY user_id
  `).all(...userIds);

  const completedMap = Object.fromEntries(rows.map(r => [r.user_id, r.completed]));

  const map = {};
  for (const userId of userIds) {
    map[userId] = { completed: completedMap[userId] || 0, total };
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
    SELECT rs.*, u.name, u.instagram_handle, u.profile_photo,
           md.followers_count, md.followers_previous, md.revenue, md.revenue_previous
    FROM ranking_snapshots rs
    JOIN users u ON u.id = rs.user_id AND u.role != 'admin'
    LEFT JOIN monthly_data md ON md.user_id = rs.user_id AND md.month = rs.month
    WHERE rs.month = ?
    ORDER BY rs.total_score DESC
  `).all(month);

  if (snapshots.length > 0) {
    return snapshots.map((s, i) => {
      const followersGained = (s.followers_count || 0) - (s.followers_previous || 0);
      const revenueGrowthPct = (s.revenue && s.revenue_previous)
        ? ((s.revenue - s.revenue_previous) / s.revenue_previous) * 100
        : 0;
      return {
        position: s.position || i + 1,
        user_id: s.user_id,
        name: s.name,
        instagram_handle: s.instagram_handle,
        avatar_url: s.profile_photo ? `/uploads/${s.profile_photo}` : null,
        checklist_score: s.checklist_score,
        revenue_score: s.revenue_score,
        followers_score: s.followers_score,
        total_score: s.total_score,
        followers_gained: followersGained < 0 ? 0 : followersGained,
        revenue_growth_pct: Math.round(revenueGrowthPct * 10) / 10,
      };
    });
  }

  const allMonthlyData = await prepare(`
    SELECT md.* FROM monthly_data md
    JOIN users u ON u.id = md.user_id AND u.role != 'admin'
    WHERE md.month = ?
  `).all(month);
  const userIds = allMonthlyData.map(d => d.user_id);
  if (userIds.length === 0) return [];

  const checklistProgress = await buildChecklistProgressMap(userIds);
  const scores = calculateMonthRanking(allMonthlyData, checklistProgress);

  const monthlyMap = Object.fromEntries(allMonthlyData.map(d => [d.user_id, d]));

  const scoreUserIds = scores.map(s => s.user_id);
  const placeholders = scoreUserIds.map(() => '?').join(',');
  const users = await prepare(`SELECT id, name, instagram_handle, profile_photo FROM users WHERE id IN (${placeholders})`).all(...scoreUserIds);
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  return scores.map((s) => {
    const user = userMap[s.user_id] || {};
    const md = monthlyMap[s.user_id] || {};
    const followersGained = (md.followers_count || 0) - (md.followers_previous || 0);
    const revenueGrowthPct = (md.revenue && md.revenue_previous)
      ? ((md.revenue - md.revenue_previous) / md.revenue_previous) * 100
      : 0;
    return {
      position: s.position,
      user_id: s.user_id,
      name: user.name || null,
      instagram_handle: user.instagram_handle || null,
      avatar_url: user.profile_photo ? `/uploads/${user.profile_photo}` : null,
      checklist_score: s.checklist_score,
      revenue_score: s.revenue_score,
      followers_score: s.followers_score,
      total_score: s.total_score,
      followers_gained: followersGained < 0 ? 0 : followersGained,
      revenue_growth_pct: Math.round(revenueGrowthPct * 10) / 10,
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
