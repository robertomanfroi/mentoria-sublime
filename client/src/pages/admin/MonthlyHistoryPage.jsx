import { useCallback } from 'react'
import { ExternalLink, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { adminApi } from '../../lib/api'
import { getMonthLabel, formatNumber, formatCurrency } from '../../lib/utils'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

function GrowthBadge({ value, suffix = '' }) {
  if (value === null || value === undefined) return null
  const positive = value > 0
  const negative = value < 0
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus
  const color = positive ? 'text-emerald-600' : negative ? 'text-red-500' : 'text-dark/40'
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${color}`}>
      <Icon size={11} strokeWidth={2} />
      {positive ? '+' : ''}{formatNumber(value)}{suffix}
    </span>
  )
}

function MonthCell({ cell }) {
  if (!cell) {
    return (
      <td className="px-3 py-3 text-center align-middle border-l border-beige/60">
        <span className="text-dark/25 text-xs">—</span>
      </td>
    )
  }
  return (
    <td className="px-3 py-3 align-top border-l border-beige/60 min-w-[180px]">
      <div className="space-y-1.5">
        {/* Seguidores */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wide text-dark/40 font-body">Seguidores</span>
          <span className="text-sm font-semibold text-dark font-body">
            {cell.followers_current !== null ? formatNumber(cell.followers_current) : '—'}
          </span>
        </div>
        {cell.followers_gained !== 0 && (
          <div className="flex justify-end">
            <GrowthBadge value={cell.followers_gained} />
          </div>
        )}

        {/* Faturamento */}
        <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-beige/50">
          <span className="text-[10px] uppercase tracking-wide text-dark/40 font-body">Faturamento</span>
          <span className="text-sm font-semibold text-dark font-body">
            {cell.revenue_current !== null ? formatCurrency(cell.revenue_current) : '—'}
          </span>
        </div>
        {cell.revenue_growth_pct !== null && (
          <div className="flex justify-end">
            <GrowthBadge value={cell.revenue_growth_pct} suffix="%" />
          </div>
        )}

        {/* Status + comprovante */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-beige/50">
          {cell.validated ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <CheckCircle2 size={12} strokeWidth={2} /> Validado
            </span>
          ) : cell.validation_status === 2 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
              <XCircle size={12} strokeWidth={2} /> Rejeitado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <Clock size={12} strokeWidth={2} /> Pendente
            </span>
          )}
          {cell.proof_url && (
            <a
              href={cell.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gold hover:underline"
              title="Ver comprovante"
            >
              <ExternalLink size={11} strokeWidth={2} /> Print
            </a>
          )}
        </div>
      </div>
    </td>
  )
}

export default function MonthlyHistoryPage() {
  const fetchHistory = useCallback(() => adminApi.getMonthlyHistory(), [])
  const { data, loading, error } = useApi(fetchHistory)

  if (loading) return <LoadingSpinner centered />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        Erro ao carregar o histórico mensal. Tente novamente.
      </div>
    )
  }

  const months = data?.months || []
  const rows = data?.data || []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-dark">Histórico Mensal</h1>
        <p className="text-sm text-dark/50 font-body mt-0.5">
          Dados de todas as mentoradas mês a mês — seguidores, faturamento e validação.
        </p>
      </div>

      {months.length === 0 || rows.length === 0 ? (
        <div className="rounded-xl border border-beige bg-white px-6 py-12 text-center">
          <p className="text-dark/50 font-body">Nenhum dado mensal registrado ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-beige bg-white shadow-soft">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-cream/60">
                <th className="sticky left-0 z-10 bg-cream/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-dark/50 font-body min-w-[200px]">
                  Mentorada
                </th>
                {months.map((m) => (
                  <th
                    key={m}
                    className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-dark/60 font-body border-l border-beige/60 whitespace-nowrap"
                  >
                    {getMonthLabel(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-beige/60 hover:bg-cream/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar src={row.avatar_url} name={row.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark font-body truncate">{row.name}</p>
                        {row.instagram_handle && (
                          <p className="text-[11px] text-dark/45 font-body truncate">@{row.instagram_handle}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {months.map((m) => (
                    <MonthCell key={m} cell={row.months[m]} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
