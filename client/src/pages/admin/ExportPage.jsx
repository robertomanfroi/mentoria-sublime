import { useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { getCurrentMonth, getLastNMonths, formatMonth } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const months = getLastNMonths(12)

export default function ExportPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExport() {
    setLoading(true)
    setError('')

    try {
      const res = await adminApi.exportRanking(selectedMonth)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ranking-${selectedMonth}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(
        'Erro ao exportar: ' +
          (err?.response?.data?.error || err?.response?.data?.message || err?.message)
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-dark">
          Exportar Dados
        </h1>
        <p className="text-sm font-body text-dark/50 mt-0.5">
          Exporte o ranking completo em formato CSV.
        </p>
      </div>

      <Card className="space-y-5 animate-fade-in-up">
        <h3 className="font-display text-base font-semibold text-dark">
          Exportar Ranking por Mês
        </h3>

        <div>
          <label className="text-sm font-body text-dark/60 mb-2 block">
            Selecione o mês
          </label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-nude-medium bg-white text-sm font-body text-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 pointer-events-none"
            />
          </div>
        </div>

        <div className="p-3 bg-nude-light rounded-xl">
          <p className="text-xs font-body text-dark/50 leading-relaxed">
            O arquivo CSV incluirá: posição, nome, @instagram, seguidores, crescimento,
            faturamento, crescimento de faturamento, score e estrelas.
            <strong className="text-dark ml-1">Dados de faturamento são incluídos apenas no export admin.</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-body text-red-600">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={handleExport}
          className="w-full gap-2"
        >
          <Download size={16} />
          Exportar CSV — {formatMonth(selectedMonth)}
        </Button>
      </Card>
    </div>
  )
}
