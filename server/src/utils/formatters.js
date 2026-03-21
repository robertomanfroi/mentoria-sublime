/**
 * Remove campos de revenue de um registro monthly_data.
 * Usado em endpoints públicos/mentoradas para não expor dados financeiros.
 */
function sanitizeMonthlyData(row) {
  if (!row) return row;
  const { revenue, revenue_previous, ...safe } = row;
  return safe;
}

module.exports = { sanitizeMonthlyData };
