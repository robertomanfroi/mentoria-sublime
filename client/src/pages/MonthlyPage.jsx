import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, ImageIcon, ChevronDown } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { monthlyApi } from '../lib/api'
import {
  getCurrentMonth,
  getLastNMonths,
  formatMonth,
  formatNumber,
} from '../lib/utils'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const months = getLastNMonths(12)

export default function MonthlyPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [followersCurrentStr, setFollowersCurrent] = useState('')
  const [followersPreviousStr, setFollowersPrevious] = useState('')
  const [revenueCurrentStr, setRevenueCurrent] = useState('')
  const [revenuePreviousStr, setRevenuePrevious] = useState('')
  const [printFile, setPrintFile] = useState(null)
  const [printPreview, setPrintPreview] = useState('')
  const [dragging, setDragging] = useState(false)

  const fileRef = useRef(null)

  // Dados do mês selecionado
  const dataFn = useCallback(() => monthlyApi.getData(selectedMonth), [selectedMonth])
  const { data: monthData, loading, refetch } = useApi(dataFn)

  // Histórico (API retorna array direto)
  const histFn = useCallback(() => monthlyApi.getHistory(), [])
  const { data: historyRaw, loading: histLoading } = useApi(histFn)
  const history = Array.isArray(historyRaw) ? historyRaw : []

  // Preencher form com dados existentes ao carregar
  useEffect(() => {
    if (monthData && !monthData.error) {
      setFollowersCurrent(String(monthData.followers_count || ''))
      setFollowersPrevious(String(monthData.followers_previous || ''))
      setRevenueCurrent(String(monthData.revenue || ''))
      setRevenuePrevious(String(monthData.revenue_previous || ''))
    } else {
      setFollowersCurrent('')
      setFollowersPrevious('')
      setRevenueCurrent('')
      setRevenuePrevious('')
    }
  }, [monthData])

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setPrintFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPrintPreview(reader.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      await monthlyApi.submit(selectedMonth, {
        followers_count: Number(followersCurrentStr) || 0,
        followers_previous: Number(followersPreviousStr) || 0,
        revenue: Number(revenueCurrentStr) || 0,
        revenue_previous: Number(revenuePreviousStr) || 0,
      })

      // Upload do print se houver (separado)
      if (printFile) {
        const fd = new FormData()
        fd.append('proof', printFile)
        await monthlyApi.uploadProof(selectedMonth, fd)
      }

      setSuccess(true)
      refetch()
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // monthData é o próprio objeto (404 retorna null via useApi)
  const submission = monthData && !monthData.error ? monthData : null
  const status = submission?.validated_by_admin === 1 ? 'approved'
    : submission?.validated_by_admin === 2 ? 'rejected'
    : submission ? 'pending' : null

  const statusConfig = {
    pending: { variant: 'warning', label: 'Pendente Validação' },
    approved: { variant: 'success', label: 'Validado ✓' },
    rejected: { variant: 'danger', label: 'Rejeitado' },
  }
  const statusInfo = statusConfig[status] || null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Seletor de mês */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-nude-medium bg-white text-sm font-body text-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 pointer-events-none" />
        </div>

        {statusInfo && (
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        )}
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-5 animate-fade-in-up-delay-1">
            <h3 className="font-display text-lg font-semibold text-dark">
              Seguidores — {formatMonth(selectedMonth)}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Seguidores (mês anterior)"
                type="number"
                value={followersPreviousStr}
                onChange={(e) => setFollowersPrevious(e.target.value)}
                min={0}
              />
              <Input
                label="Seguidores (atual)"
                type="number"
                value={followersCurrentStr}
                onChange={(e) => setFollowersCurrent(e.target.value)}
                min={0}
              />
            </div>

            {followersCurrentStr && followersPreviousStr && (
              <div className="p-3 bg-nude-light rounded-xl">
                <p className="text-sm font-body text-dark/60">
                  Crescimento:{' '}
                  <span className="font-semibold text-dark">
                    +{formatNumber(
                      Number(followersCurrentStr) - Number(followersPreviousStr)
                    )}{' '}
                    seguidores
                  </span>
                </p>
              </div>
            )}
          </Card>

          {/* Faturamento — privado */}
          <Card className="space-y-5 mt-4 animate-fade-in-up-delay-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-dark">
                Faturamento
              </h3>
              <Badge variant="default">
                🔒 Privado
              </Badge>
            </div>
            <p className="text-xs font-body text-dark/40 -mt-3">
              Seus dados de faturamento são confidenciais e nunca aparecem para outras mentoradas.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Faturamento (mês anterior)"
                type="number"
                value={revenuePreviousStr}
                onChange={(e) => setRevenuePrevious(e.target.value)}
                min={0}
                step="0.01"
              />
              <Input
                label="Faturamento (atual)"
                type="number"
                value={revenueCurrentStr}
                onChange={(e) => setRevenueCurrent(e.target.value)}
                min={0}
                step="0.01"
              />
            </div>
          </Card>

          {/* Upload comprovante */}
          <Card className="space-y-4 mt-4 animate-fade-in-up-delay-3">
            <h3 className="font-display text-lg font-semibold text-dark">
              Comprovante (print)
            </h3>

            {printPreview || submission?.instagram_proof_image ? (
              <div className="relative group">
                <img
                  src={printPreview || `/uploads/proofs/${submission?.instagram_proof_image}`}
                  alt="Comprovante"
                  className="w-full max-h-48 object-cover rounded-xl border border-nude-medium/40"
                />
                {printPreview && (
                  <button
                    type="button"
                    onClick={() => { setPrintFile(null); setPrintPreview('') }}
                    className="absolute top-2 right-2 p-1.5 bg-dark/70 rounded-lg text-white hover:bg-dark transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`
                  flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer
                  transition-all duration-200
                  ${dragging
                    ? 'border-gold bg-gold/10'
                    : 'border-nude-medium hover:border-gold/60 hover:bg-nude-light/50'
                  }
                `}
              >
                <div className="w-10 h-10 rounded-xl bg-nude-light flex items-center justify-center">
                  <Upload size={20} className="text-gold" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-body font-medium text-dark">
                    Arraste ou clique para enviar
                  </p>
                  <p className="text-xs font-body text-dark/40 mt-0.5">
                    PNG, JPG, JPEG — máx. 5MB
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </Card>

          {/* Feedback */}
          {success && (
            <div className="p-3 bg-sage/10 border border-sage/30 rounded-xl animate-fade-in-up">
              <p className="text-sm font-body text-sage font-medium">
                ✓ Dados enviados com sucesso! Aguardando validação.
              </p>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-body text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            className="w-full mt-4"
          >
            {submission ? 'Atualizar Dados' : 'Enviar Dados'}
          </Button>
        </form>
      )}

      {/* Histórico */}
      {!histLoading && history.length > 0 && (
        <Card className="animate-fade-in-up-delay-4">
          <h3 className="font-display text-base font-semibold text-dark mb-4">
            Histórico
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-nude-medium/30">
                  <th className="py-2 text-left text-xs text-dark/50 font-medium">Mês</th>
                  <th className="py-2 text-right text-xs text-dark/50 font-medium">Seguidores</th>
                  <th className="py-2 text-right text-xs text-dark/50 font-medium">Crescimento</th>
                  <th className="py-2 text-right text-xs text-dark/50 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nude-medium/20">
                {history.map((m) => {
                  const gained = (m.followers_count || 0) - (m.followers_previous || 0)
                  const mStatus = m.validated_by_admin === 1 ? 'approved'
                    : m.validated_by_admin === 2 ? 'rejected'
                    : 'pending'
                  const s = statusConfig[mStatus]
                  return (
                    <tr key={m.month}>
                      <td className="py-2.5 text-dark">{formatMonth(m.month)}</td>
                      <td className="py-2.5 text-right text-dark/70">
                        {formatNumber(m.followers_count || 0)}
                      </td>
                      <td className={`py-2.5 text-right font-medium ${gained >= 0 ? 'text-sage' : 'text-red-500'}`}>
                        {gained >= 0 ? '+' : ''}{formatNumber(gained)}
                      </td>
                      <td className="py-2.5 text-right">
                        {s ? (
                          <Badge variant={s.variant}>{s.label}</Badge>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

const statusConfig = {
  pending: { variant: 'warning', label: 'Pendente' },
  approved: { variant: 'success', label: 'Validado' },
  rejected: { variant: 'danger', label: 'Rejeitado' },
}
