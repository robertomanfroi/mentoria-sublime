import { useCallback, useState } from 'react'
import { ExternalLink, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown, Minus, Undo2, CalendarClock, RefreshCw } from 'lucide-react'
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

function MonthCell({ cell, onUnapprove, unapproving }) {
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
        {cell.revenue_last_year !== null && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] text-dark/40 font-body">Ano anterior</span>
            <span className="text-xs text-dark/60 font-body">{formatCurrency(cell.revenue_last_year)}</span>
          </div>
        )}
        {cell.revenue_growth_pct !== null && (
          <div className="flex justify-end">
            <span title={cell.revenue_growth_basis === 'ano_anterior' ? 'vs mesmo mês do ano anterior' : 'vs mês anterior'}>
              <GrowthBadge value={cell.revenue_growth_pct} suffix={cell.revenue_growth_basis === 'ano_anterior' ? '% a/a' : '% m/m'} />
            </span>
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

        {cell.yoy_status === 'solicitado' && (
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-dark/50">
            <CalendarClock size={12} strokeWidth={2} /> Falta o ano anterior
          </div>
        )}

        {/* Botão Desaprovar — só aparece para registros validados */}
        {cell.validated && cell.monthly_data_id && (
          <div className="pt-1">
            <button
              onClick={() => onUnapprove(cell.monthly_data_id)}
              disabled={unapproving}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50"
              title="Desaprovar — a mentorada poderá preencher novamente"
            >
              <Undo2 size={11} strokeWidth={2} />
              {unapproving ? 'Desaprovando...' : 'Desaprovar'}
            </button>
          </div>
        )}
      </div>
    </td>
  )
}

export default function MonthlyHistoryPage() {
  const fetchHistory = useCallback(() => adminApi.getMonthlyHistory(), [])
  const { data, loading, error, refetch } = useApi(fetchHistory)
  const [unapprovingId, setUnapprovingId] = useState(null)
  const [busy, setBusy] = useState(null) // 'recalc'
  const [notice, setNotice] = useState('')

  async function handleRecalcAll() {
    if (!window.confirm('Reprocessar o ranking de todos os meses com a regra atual? O ranking anterior fica guardado no histórico.')) return
    setBusy('recalc')
    setNotice('')
    try {
      const res = await adminApi.recalculateAllRankings()
      const months = res.data?.months || []
      setNotice(`✓ Ranking reprocessado em ${months.length} mês(es).`)
    } catch (err) {
      setNotice('Erro: ' + (err.response?.data?.error || err.message))
    } finally {
      setBusy(null)
    }
  }

  async function handleUnapprove(monthlyDataId) {
    if (!window.confirm('Desaprovar este registro? A mentorada poderá preencher os dados novamente e o ranking será recalculado.')) return
    setUnapprovingId(monthlyDataId)
    try {
      await adminApi.unapproveValidation(monthlyDataId)
      refetch()
    } catch (err) {
      alert('Erro ao desaprovar: ' + (err.response?.data?.error || err.message))
    } finally {
      setUnapprovingId(null)
    }
  }

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-dark">Histórico Mensal</h1>
          <p className="text-sm text-dark/50 font-body mt-0.5">
            Dados de todas as mentoradas mês a mês — seguidores, faturamento e validação.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleRecalcAll}
              disabled={!!busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-beige bg-white px-3 py-2 text-xs font-medium text-dark font-body hover:border-gold disabled:opacity-50"
            >
              <RefreshCw size={14} />
              {busy === 'recalc' ? 'Reprocessando...' : 'Reprocessar ranking'}
            </button>
          </div>
          {notice && (
            <p className={`text-xs font-body ${notice.startsWith('✓') ? 'text-emerald-600' : 'text-amber-600'}`}>{notice}</p>
          )}
        </div>
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
                    <MonthCell
                      key={m}
                      cell={row.months[m]}
                      onUnapprove={handleUnapprove}
                      unapproving={unapprovingId === row.months[m]?.monthly_data_id}
                    />
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
