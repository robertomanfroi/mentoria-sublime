const { prepare } = require('../../config/database');
const { FIRST_MONTH, calculateMonthRanking, getRevenueGrowthPct } = require('../../utils/rankingCalculator');

// Cache simples em memória (TTL: 60 segundos)
const rankingCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function getCached(key) {
  const entry = rankingCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    rankingCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  rankingCache.set(key, { data, timestamp: Date.now() });
}

function invalidateRankingCache(month) {
  rankingCache.delete(`ranking-${month}`);
  rankingCache.delete('ranking-geral');
}

async function buildChecklistProgressMap(userIds) {
  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const total = totalRow.cnt;

  if (userIds.length === 0) return {};

  // Uma única query com GROUP BY em vez de N queries individuais
  const placeholders = userIds.map(() => '?').join(',');
  const rows = await prepare(`
    SELECT cp.user_id, COUNT(*) as completed
    FROM checklist_progress cp
    JOIN checklist_items ci ON ci.id = cp.checklist_item_id AND ci.active = 1
    WHERE cp.user_id IN (${placeholders}) AND cp.completed = 1
    GROUP BY cp.user_id
  `).all(...userIds);

  const completedMap = Object.fromEntries(rows.map(r => [r.user_id, r.completed]));

  const map = {};
  for (const userId of userIds) {
    map[userId] = { completed: completedMap[userId] || 0, total };
  }

  return map;
}

async function getRankingForMonth(month, { page = 1, limit = 100 } = {}) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }

  // Meses anteriores ao início da mentoria não entram no ranking
  if (month < FIRST_MONTH) return { data: [], total: 0, page: 1, totalPages: 0 };

  const cached = getCached(`ranking-${month}`);
  if (cached) return cached;

  const snapshots = await prepare(`
    SELECT rs.*, u.name, u.instagram_handle, u.profile_photo,
           md.followers_count, md.followers_previous, md.revenue, md.revenue_previous, md.revenue_last_year
    FROM ranking_snapshots rs
    JOIN users u ON u.id = rs.user_id AND u.role != 'admin'
    LEFT JOIN monthly_data md ON md.user_id = rs.user_id AND md.month = rs.month
    WHERE rs.month = ?
    ORDER BY rs.total_score DESC
  `).all(month);

  if (snapshots.length > 0) {
    const result = snapshots.map((s, i) => {
      const followersGained = (s.followers_count || 0) - (s.followers_previous || 0);
      const revenueGrowthPct = getRevenueGrowthPct(s) ?? 0;
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
    setCache(`ranking-${month}`, result);

    const safeLimit2 = Math.max(1, Number(limit) || 100);
    const safePage2  = Math.max(1, Number(page) || 1);
    const total2 = result.length;
    const totalPages2 = Math.ceil(total2 / safeLimit2);
    const offset2 = (safePage2 - 1) * safeLimit2;
    return { data: result.slice(offset2, offset2 + safeLimit2), total: total2, page: safePage2, totalPages: totalPages2 };
  }

  const allMonthlyData = await prepare(`
    SELECT md.* FROM monthly_data md
    JOIN users u ON u.id = md.user_id AND u.role != 'admin'
    WHERE md.month = ? AND md.validated_by_admin = 1
    ORDER BY md.created_at ASC
  `).all(month);
  const userIds = allMonthlyData.map(d => d.user_id);
  if (userIds.length === 0) {
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }

  const checklistProgress = await buildChecklistProgressMap(userIds);
  const scores = calculateMonthRanking(allMonthlyData, checklistProgress);

  const monthlyMap = Object.fromEntries(allMonthlyData.map(d => [d.user_id, d]));

  const scoreUserIds = scores.map(s => s.user_id);
  const placeholders = scoreUserIds.map(() => '?').join(',');
  const users = await prepare(`SELECT id, name, instagram_handle, profile_photo FROM users WHERE id IN (${placeholders})`).all(...scoreUserIds);
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const liveResult = scores.map((s) => {
    const user = userMap[s.user_id] || {};
    const md = monthlyMap[s.user_id] || {};
    const followersGained = (md.followers_count || 0) - (md.followers_previous || 0);
    const revenueGrowthPct = getRevenueGrowthPct(md) ?? 0;
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

  // Salvar snapshot automaticamente para persistir o ranking calculado
  try {
    const { executeTransaction } = require('../../config/database');
    const insertSql = `INSERT OR REPLACE INTO ranking_snapshots (user_id, month, checklist_score, revenue_score, followers_score, total_score, position) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    // Arquiva snapshot existente antes de substituir (defensivo — este caminho só roda sem snapshot prévio)
    const archiveSql = `INSERT INTO ranking_snapshots_history (user_id, month, checklist_score, revenue_score, followers_score, total_score, position)
      SELECT user_id, month, checklist_score, revenue_score, followers_score, total_score, position
      FROM ranking_snapshots WHERE month = ?`;
    await executeTransaction([
      { sql: archiveSql, args: [month] },
      { sql: 'DELETE FROM ranking_snapshots WHERE month = ?', args: [month] },
      ...scores.map(s => ({ sql: insertSql, args: [s.user_id, month, s.checklist_score, s.revenue_score, s.followers_score, s.total_score, s.position] })),
    ]);
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), action: 'auto_calculate_ranking', details: { month, count: scores.length } }));
  } catch (saveErr) {
    console.error('[ranking] falha ao salvar snapshot automático:', saveErr.message);
  }

  setCache(`ranking-${month}`, liveResult);

  const safeLimit = Math.max(1, Number(limit) || 100);
  const safePage  = Math.max(1, Number(page) || 1);
  const total = liveResult.length;
  const totalPages = Math.ceil(total / safeLimit);
  const offset = (safePage - 1) * safeLimit;
  const paginated = liveResult.slice(offset, offset + safeLimit);

  return { data: paginated, total, page: safePage, totalPages };
}

async function getMyPosition(userId, month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error('Formato de mês inválido. Use YYYY-MM.');
    err.status = 400;
    throw err;
  }

  const rankingResult = await getRankingForMonth(month, { page: 1, limit: 10000 });
  const allEntries = rankingResult.data || rankingResult;
  const myEntry = allEntries.find(r => r.user_id === userId);

  if (!myEntry) {
    return { position: null, scores: null, message: 'Dados não encontrados para este mês.' };
  }

  return myEntry;
}

// Converte 'YYYY-MM' em um índice inteiro de meses (para subtração de datas)
function monthIndex(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  return y * 12 + m;
}

// Meses entre o primeiro mês preenchido e o mês de referência (ambos inclusos)
function monthsInPeriod(firstMonth, referenceMonth) {
  return monthIndex(referenceMonth) - monthIndex(firstMonth) + 1;
}

// Peso de confiança do ranking geral: quantos meses de histórico valem "meia confiança".
// Com k = 3, um mês conta 25% do próprio score, 3 meses 50%, 6 meses 67%, 10 meses 77% —
// o restante é ancorado na média da turma. Evita que um único mês excelente lidere o geral.
const CONFIDENCE_K = 3;

function applyConfidence(avgScore, monthsCount, anchor) {
  const weight = monthsCount / (monthsCount + CONFIDENCE_K);
  return avgScore * weight + anchor * (1 - weight);
}

async function getGeneralRanking() {
  const cached = getCached('ranking-geral');
  if (cached) return cached;

  // Busca todos os snapshots individuais (não agregados) para calcular a média
  // ponderada pelo período total desde o primeiro mês preenchido por cada usuária —
  // meses sem preenchimento no meio do período contam como zero, então quem
  // preenche pouco em relação ao tempo de mentoria não fica artificialmente bem
  // posicionada por causa de um único mês bom.
  const rows = await prepare(`
    SELECT rs.user_id, rs.month, rs.total_score, rs.checklist_score, rs.revenue_score, rs.followers_score,
           u.name, u.instagram_handle, u.profile_photo
    FROM ranking_snapshots rs
    JOIN users u ON u.id = rs.user_id AND u.role != 'admin'
    WHERE rs.month >= ?
    ORDER BY rs.user_id, rs.month
  `).all(FIRST_MONTH);

  if (rows.length === 0) return { data: [], total: 0 };

  const followersRows = await prepare(`
    SELECT user_id,
           SUM(COALESCE(followers_count, 0) - COALESCE(followers_previous, 0)) AS followers_gained
    FROM monthly_data
    WHERE validated_by_admin = 1 AND month >= ?
    GROUP BY user_id
  `).all(FIRST_MONTH);
  const followersGainedByUser = new Map(followersRows.map((r) => [r.user_id, r.followers_gained || 0]));

  const referenceMonth = rows.reduce((max, r) => (r.month > max ? r.month : max), rows[0].month);

  const byUser = new Map();
  for (const r of rows) {
    if (!byUser.has(r.user_id)) byUser.set(r.user_id, []);
    byUser.get(r.user_id).push(r);
  }

  const result = [];
  for (const [userId, recs] of byUser) {
    const firstMonth = recs.reduce((min, r) => (r.month < min ? r.month : min), recs[0].month);
    const totalMonths = monthsInPeriod(firstMonth, referenceMonth);
    const monthsCount = recs.length;
    const sumScore = recs.reduce((acc, r) => acc + r.total_score, 0);
    const sumChecklist = recs.reduce((acc, r) => acc + r.checklist_score, 0);
    const sumRevenue = recs.reduce((acc, r) => acc + r.revenue_score, 0);
    const sumFollowers = recs.reduce((acc, r) => acc + r.followers_score, 0);
    const bestScore = Math.max(...recs.map((r) => r.total_score));

    result.push({
      user_id: userId,
      name: recs[0].name,
      instagram_handle: recs[0].instagram_handle,
      avatar_url: recs[0].profile_photo ? `/uploads/${recs[0].profile_photo}` : null,
      avg_score: Math.round((sumScore / totalMonths) * 100) / 100,
      sum_score: Math.round(sumScore * 100) / 100,
      best_score: Math.round(bestScore * 100) / 100,
      months_count: monthsCount,
      months_period: totalMonths,
      avg_checklist: Math.round((sumChecklist / totalMonths) * 100) / 100,
      avg_revenue: Math.round((sumRevenue / totalMonths) * 100) / 100,
      avg_followers: Math.round((sumFollowers / totalMonths) * 100) / 100,
      followers_gained: followersGainedByUser.get(userId) || 0,
    });
  }

  // Âncora: média da turma. Quem tem pouco histórico é puxada para ela até acumular meses.
  const anchor = result.length
    ? result.reduce((acc, r) => acc + r.avg_score, 0) / result.length
    : 0;

  for (const r of result) {
    r.raw_avg_score = r.avg_score;
    r.confidence_weight = Math.round((r.months_count / (r.months_count + CONFIDENCE_K)) * 100) / 100;
    r.adjusted_score = Math.round(applyConfidence(r.avg_score, r.months_count, anchor) * 100) / 100;
  }

  result.sort((a, b) => (b.adjusted_score - a.adjusted_score) || (b.months_count - a.months_count));
  result.forEach((r, i) => {
    r.position = i + 1;
    r.checklist_score = r.avg_checklist; // alias para StarGroup
    r.total_score = r.adjusted_score; // pontuação exibida já com o peso de histórico
  });

  setCache('ranking-geral', result);
  return { data: result, total: result.length };
}

module.exports = { getRankingForMonth, getGeneralRanking, getMyPosition, buildChecklistProgressMap, invalidateRankingCache };
