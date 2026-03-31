import { useState, useCallback } from 'react'
import { RefreshCw, CheckCheck, Database } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { adminApi } from '../../lib/api'
import { getCurrentMonth, formatMonth } from '../../lib/utils'
import ValidationCard from '../../components/admin/ValidationCard'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ValidationsPage() {
  const [calculatingMonth, setCalculatingMonth] = useState(null)
  const [approvingAll, setApprovingAll]         = useState(false)
  const [calcResult, setCalcResult]             = useState('')
  const [showDiag, setShowDiag]                 = useState(false)

  const currentMonth = getCurrentMonth()
  const fn = useCallback(() => adminApi.getPendingValidations(currentMonth), [currentMonth])
  const { data, loading, refetch } = useApi(fn)

  const diagFn = useCallback(() => adminApi.getDiagnostic(currentMonth), [currentMonth])
  const { data: diagData, loading: diagLoading, refetch: refetchDiag } = useApi(diagFn, [], { immediate: false })

  const submissions = data?.data || data?.submissions || data || []
  const totalSubmissions = data?.total ?? submissions.length

  async function handleCalculateRanking() {
    const month = currentMonth
    setCalculatingMonth(month)
    setCalcResult('')
    try {
      const res = await adminApi.calculateRanking(month)
      const count = res?.data?.count ?? 0
      if (count === 0) {
        setCalcResult(`⚠ Nenhum dado validado para ${formatMonth(month)}. Use "Aprovar Todas" primeiro.`)
      } else {
        setCalcResult(`✓ Ranking de ${formatMonth(month)} calculado! (${count} mentoradas)`)
      }
      if (showDiag) refetchDiag()
    } catch (err) {
      setCalcResult('Erro: ' + (err?.response?.data?.error || err?.message))
    } finally {
      setCalculatingMonth(null)
    }
  }

  async function handleApproveAll() {
    const month = currentMonth
    setApprovingAll(true)
    setCalcResult('')
    try {
      const res = await adminApi.approveAllPending(month)
      if (res.status === 207) {
        setCalcResult(`⚠ ${res.data.message}`)
      } else {
        setCalcResult(`✓ ${res.data.message}`)
      }
      refetch()
    } catch (err) {
      setCalcResult('Erro: ' + (err?.response?.data?.error || err?.message))
    } finally {
      setApprovingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-dark">
            Validações Pendentes
          </h1>
          <p className="text-sm font-body text-dark/50 mt-0.5">
            {totalSubmissions} submissão(ões) aguardando validação
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="primary"
              size="md"
              loading={approvingAll}
              onClick={handleApproveAll}
              className="gap-2"
            >
              <CheckCheck size={15} />
              Aprovar Todas + Ranking
            </Button>
            <Button
              variant="ghost"
              size="md"
              loading={!!calculatingMonth}
              onClick={handleCalculateRanking}
              className="gap-2"
            >
              <RefreshCw size={15} />
              Só Recalcular
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => { const next = !showDiag; setShowDiag(next); if (next) refetchDiag(); }}
              className="gap-2"
            >
              <Database size={15} />
              Diagnóstico
            </Button>
          </div>
          {calcResult && (
            <p className={`text-xs font-body ${calcResult.startsWith('✓') ? 'text-sage' : 'text-amber-600'}`}>
              {calcResult}
            </p>
          )}
        </div>
      </div>

      {/* Painel diagnóstico */}
      {showDiag && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-mono space-y-2">
          <p className="font-semibold text-amber-800">Diagnóstico — {formatMonth(currentMonth)}</p>
          {diagLoading ? <p className="text-amber-600">Carregando...</p> : diagData ? (
            <>
              <p>
                <span className="font-semibold">monthly_data:</span>{' '}
                {diagData.monthly_data?.total ?? 0} total —{' '}
                <span className="text-green-700">{diagData.monthly_data?.validated ?? 0} validados</span> /{' '}
                <span className="text-red-600">{diagData.monthly_data?.pending ?? 0} pendentes</span>
              </p>
              <p>
                <span className="font-semibold">ranking_snapshots:</span>{' '}
                {diagData.snapshots?.total ?? 0} entradas salvas
              </p>
              {diagData.monthly_data?.rows?.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="font-semibold text-amber-800">Dados por mentorada:</p>
                  {diagData.monthly_data.rows.map(r => (
                    <p key={r.id} className={r.validated_by_admin ? 'text-green-700' : 'text-red-600'}>
                      {r.validated_by_admin ? '✓' : '✗'} {r.name} — seguidores: {r.followers_count ?? '?'} / anterior: {r.followers_previous ?? '?'} — faturamento: {r.revenue ?? '?'}
                    </p>
                  ))}
                </div>
              )}
              {(diagData.monthly_data?.rows?.length ?? 0) === 0 && (
                <p className="text-red-700 font-semibold">Nenhum dado de monthly_data encontrado para {currentMonth}!</p>
              )}
            </>
          ) : <p className="text-amber-600">Sem dados.</p>}
        </div>
      )}

      {loading ? (
        <LoadingSpinner centered />
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h3 className="font-display text-xl font-semibold text-dark mb-2">
            Tudo em dia!
          </h3>
          <p className="font-body text-dark/50">
            Não há submissões pendentes de validação.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((submission) => (
            <ValidationCard
              key={submission.id}
              submission={submission}
              onValidated={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
