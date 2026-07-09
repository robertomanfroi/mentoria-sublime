/**
 * Remove campos de revenue de um registro monthly_data.
 * Usado em endpoints públicos/mentoradas para não expor dados financeiros.
 */
function sanitizeMonthlyData(row) {
  if (!row) return row;
  const { revenue, revenue_previous, ...safe } = row;
  return safe;
}

/**
 * Mês atual no formato "YYYY-MM" no fuso America/Sao_Paulo,
 * evitando virada de mês antecipada por UTC.
 */
function getCurrentMonth() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date()); // "YYYY-MM"
}

module.exports = { sanitizeMonthlyData, getCurrentMonth };
