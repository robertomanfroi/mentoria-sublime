/**
 * Calcula o ranking de um mês.
 *
 * @param {Array} allMonthlyData - Array de { user_id, followers_count, followers_previous, revenue, revenue_previous, validated_by_admin }
 * @param {Object} checklistProgressByUser - { [user_id]: { completed: Number, total: Number } }
 * @param {Object} weights - { checklist, revenue, followers } (opcional)
 * @returns {Array} Array de { user_id, checklist_score, revenue_score, followers_score, total_score, position }
 */

// Faixas de faturamento absoluto (R$) → score 0-100
const REVENUE_TIERS = [
  { min: 20000, score: 100 },
  { min: 10000, score: 80 },
  { min: 5000, score: 60 },
  { min: 2000, score: 40 },
  { min: 1, score: 20 },
];

function getRevenueTierScore(revenue) {
  for (const tier of REVENUE_TIERS) {
    if (revenue >= tier.min) return tier.score;
  }
  return 0;
}

function calculateMonthRanking(allMonthlyData, checklistProgressByUser, weights) {
  const w = {
    checklist: weights?.checklist ?? 0.34,
    revenue: weights?.revenue ?? 0.33,
    followers: weights?.followers ?? 0.33,
  };
  // Usa todos os dados recebidos — filtragem é responsabilidade do caller
  const validated = allMonthlyData;

  if (validated.length === 0) return [];

  // --- Checklist Score ---
  // Score checklist: (completed/total)*100
  function getChecklistScore(userId) {
    const progress = checklistProgressByUser[userId];
    if (!progress || progress.total === 0) return 0;
    return (progress.completed / progress.total) * 100;
  }

  // --- Revenue Score ---
  // Híbrido: 50% crescimento percentual (cap 100, negativo = 0) + 50% faixa de valor absoluto.
  // Sem mês anterior (rev_prev = 0): usa apenas a faixa de valor absoluto (100% do peso).
  function getRevenueScore(data) {
    const rev = data.revenue || 0;
    const revPrev = data.revenue_previous || 0;
    const tierScore = getRevenueTierScore(rev);

    if (revPrev === 0) return tierScore;

    const growth = ((rev - revPrev) / revPrev) * 100;
    const growthScore = growth < 0 ? 0 : Math.min(growth, 100);
    return growthScore * 0.5 + tierScore * 0.5;
  }

  // --- Followers Score ---
  // Crescimento percentual sobre a própria base, teto 100 (+10% = 100 pontos).
  // Sem base anterior (prev = 0): score 0 no critério (sem referência de crescimento).
  function getFollowersScore(data) {
    const curr = data.followers_count || 0;
    const prev = data.followers_previous || 0;
    if (prev === 0) return 0;
    const growthPct = ((curr - prev) / prev) * 100;
    if (growthPct <= 0) return 0;
    // +10% de crescimento = 100 pontos (escala 10x)
    return Math.min(growthPct * 10, 100);
  }

  // --- Total Score ---
  const results = validated.map(data => {
    const checklistScore = getChecklistScore(data.user_id);
    const revenueScore = getRevenueScore(data);
    const followersScore = getFollowersScore(data);
    const totalScore =
      checklistScore * w.checklist +
      revenueScore * w.revenue +
      followersScore * w.followers;

    return {
      user_id: data.user_id,
      checklist_score: Math.round(checklistScore * 100) / 100,
      revenue_score: Math.round(revenueScore * 100) / 100,
      followers_score: Math.round(followersScore * 100) / 100,
      total_score: Math.round(totalScore * 100) / 100,
    };
  });

  // Ordenar por total_score decrescente; empate → checklist_score como desempate
  results.sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    return b.checklist_score - a.checklist_score;
  });

  // Atribuir posição com lógica de empate (mesma posição para scores iguais)
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].total_score === results[i - 1].total_score &&
        results[i].checklist_score === results[i - 1].checklist_score) {
      results[i].position = results[i - 1].position;
    } else {
      results[i].position = i + 1;
    }
  }

  return results;
}

module.exports = { calculateMonthRanking, getRevenueTierScore };
