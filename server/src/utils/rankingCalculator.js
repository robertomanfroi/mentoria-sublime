/**
 * Calcula o ranking de um mês.
 *
 * @param {Array} allMonthlyData - Array de { user_id, followers_count, followers_previous, revenue, revenue_previous, validated_by_admin }
 * @param {Object} checklistProgressByUser - { [user_id]: { completed: Number, total: Number } }
 * @returns {Array} Array de { user_id, checklist_score, revenue_score, followers_score, total_score }
 */
function calculateMonthRanking(allMonthlyData, checklistProgressByUser) {
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
  // ((rev - rev_prev) / rev_prev) * 100, cap 100, negativo = 0, rev_prev = 0 → score = 0
  function getRevenueScore(data) {
    const rev = data.revenue || 0;
    const revPrev = data.revenue_previous || 0;
    if (revPrev === 0) return 0;
    const growth = ((rev - revPrev) / revPrev) * 100;
    if (growth < 0) return 0;
    return Math.min(growth, 100);
  }

  // --- Followers Score ---
  // crescimento absoluto por usuário, normalizado pelo maior crescimento
  function getFollowersGrowth(data) {
    const curr = data.followers_count || 0;
    const prev = data.followers_previous || 0;
    const growth = curr - prev;
    return growth < 0 ? 0 : growth;
  }

  const growths = validated.map(d => getFollowersGrowth(d));
  const maxGrowth = Math.max(...growths);

  function getFollowersScore(data) {
    if (maxGrowth === 0) return 0;
    const growth = getFollowersGrowth(data);
    return (growth / maxGrowth) * 100;
  }

  // --- Total Score ---
  // checklist*0.34 + faturamento*0.33 + seguidores*0.33
  const results = validated.map(data => {
    const checklistScore = getChecklistScore(data.user_id);
    const revenueScore = getRevenueScore(data);
    const followersScore = getFollowersScore(data);
    const totalScore =
      checklistScore * 0.34 +
      revenueScore * 0.33 +
      followersScore * 0.33;

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
  let position = 1;
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].total_score === results[i - 1].total_score &&
        results[i].checklist_score === results[i - 1].checklist_score) {
      results[i].position = results[i - 1].position;
    } else {
      results[i].position = position;
    }
    position++;
  }

  return results;
}

module.exports = { calculateMonthRanking };
