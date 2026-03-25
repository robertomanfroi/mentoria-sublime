/**
 * Merge de classnames (substituto leve do clsx/cn).
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Formata data para exibição: "21 de março de 2026"
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formata mês para exibição: "março/2026"
 */
export function formatMonth(yearMonth) {
  // yearMonth: "2026-03" ou Date
  if (typeof yearMonth === 'string' && yearMonth.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = yearMonth.split('-')
    const d = new Date(Number(year), Number(month) - 1, 1)
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }
  const d = yearMonth instanceof Date ? yearMonth : new Date(yearMonth)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

/**
 * Retorna label curto do mês: "Mar/26"
 */
export function getMonthLabel(yearMonth) {
  if (typeof yearMonth === 'string' && yearMonth.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = yearMonth.split('-')
    const d = new Date(Number(year), Number(month) - 1, 1)
    const m = d.toLocaleDateString('pt-BR', { month: 'short' })
    const y = String(year).slice(2)
    return `${m.charAt(0).toUpperCase() + m.slice(1, 3)}/${y}`
  }
  return yearMonth
}

/**
 * Retorna o mês atual no formato "YYYY-MM" em UTC,
 * alinhado com o timezone do servidor.
 */
export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7)
}

/**
 * Gera lista dos últimos N meses no formato "YYYY-MM"
 */
export function getLastNMonths(n = 12) {
  const months = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }
  return months
}

/**
 * Calcula percentual de crescimento entre dois valores.
 */
export function growthPercent(current, previous) {
  if (!previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Formata número com separador de milhar brasileiro.
 */
export function formatNumber(n) {
  return Number(n).toLocaleString('pt-BR')
}

/**
 * Formata valor monetário em R$.
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Trunca texto com reticências.
 */
export function truncate(text, maxLength = 50) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
}

/**
 * Retorna iniciais do nome (até 2 letras).
 */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
