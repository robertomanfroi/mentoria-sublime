import { useState, useCallback } from 'react'
import { RefreshCw, CheckCheck } from 'lucide-react'
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

  const fn = useCallback(() => adminApi.getPendingValidations(), [])
  const { data, loading, refetch } = useApi(fn)

  const submissions = data?.submissions || data || []

  async function handleCalculateRanking() {
    const month = getCurrentMonth()
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
    } catch (err) {
      setCalcResult('Erro: ' + (err?.response?.data?.error || err?.message))
    } finally {
      setCalculatingMonth(null)
    }
  }

  async function handleApproveAll() {
    const month = getCurrentMonth()
    setApprovingAll(true)
    setCalcResult('')
    try {
      const res = await adminApi.approveAllPending(month)
      setCalcResult(`✓ ${res.data.message}`)
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
            {submissions.length} submissão(ões) aguardando validação
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
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
          </div>
          {calcResult && (
            <p className={`text-xs font-body ${calcResult.startsWith('✓') ? 'text-sage' : 'text-amber-600'}`}>
              {calcResult}
            </p>
          )}
        </div>
      </div>

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
