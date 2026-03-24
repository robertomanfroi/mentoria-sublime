import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, ChevronDown, CheckCircle } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { monthlyApi } from '../lib/api'
import { getCurrentMonth, getLastNMonths, formatMonth, formatNumber } from '../lib/utils'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

/* ─── Paleta oficial ──────────────────────────────────────────────────── */
const GOLD      = '#C7AA89'
const GOLD_DARK = '#8e7028'
const BROWN     = '#3D281C'
const MID       = '#604E44'
const CREAM     = '#F6F2E7'
const BEIGE     = '#D8D1C1'
const DARK      = '#292929'

const months = getLastNMonths(12)

const statusConfig = {
  pending:  { variant: 'warning', label: 'Pendente' },
  approved: { variant: 'success', label: 'Validado ✓' },
  rejected: { variant: 'danger',  label: 'Rejeitado' },
}

/* ─── Componente de seção/card ────────────────────────────────────────── */
function SectionCard({ title, badge, subtitle, children }) {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: '#ffffff',
        border: `1px solid rgba(216,209,193,0.6)`,
        boxShadow: '0 2px 12px rgba(41,41,41,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Header do card */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid rgba(216,209,193,0.4)` }}
      >
        <div>
          <h3
            className="font-display font-semibold"
            style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '17px', color: BROWN }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="font-body mt-0.5" style={{ fontSize: '11px', color: `${MID}70` }}>
              {subtitle}
            </p>
          )}
        </div>
        {badge}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

export default function MonthlyPage() {
  const [selectedMonth, setSelectedMonth]       = useState(getCurrentMonth())
  const [saving, setSaving]                     = useState(false)
  const [success, setSuccess]                   = useState(false)
  const [error, setError]                       = useState('')
  const [followersCurrentStr, setFollowersCurrent]   = useState('')
  const [followersPreviousStr, setFollowersPrevious] = useState('')
  const [revenueCurrentStr, setRevenueCurrent]       = useState('')
  const [revenuePreviousStr, setRevenuePrevious]     = useState('')
  const [printFile, setPrintFile]               = useState(null)
  const [printPreview, setPrintPreview]         = useState('')
  const [dragging, setDragging]                 = useState(false)

  const fileRef = useRef(null)

  const dataFn = useCallback(() => monthlyApi.getData(selectedMonth), [selectedMonth])
  const { data: monthData, loading, refetch } = useApi(dataFn)

  const histFn = useCallback(() => monthlyApi.getHistory(), [])
  const { data: historyRaw, loading: histLoading } = useApi(histFn)
  const history = Array.isArray(historyRaw) ? historyRaw : []

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
    handleFile(e.dataTransfer.files?.[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await monthlyApi.submit(selectedMonth, {
        followers_count:    Number(followersCurrentStr) || 0,
        followers_previous: Number(followersPreviousStr) || 0,
        revenue:            Number(revenueCurrentStr) || 0,
        revenue_previous:   Number(revenuePreviousStr) || 0,
      })
      if (printFile) {
        const fd = new FormData()
        fd.append('proof', printFile)
        await monthlyApi.uploadProof(selectedMonth, fd)
      }
      setSuccess(true)
      refetch()
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const submission = monthData && !monthData.error ? monthData : null
  const status     = submission?.validated_by_admin === 1 ? 'approved'
                   : submission?.validated_by_admin === 2 ? 'rejected'
                   : submission ? 'pending' : null
  const statusInfo = statusConfig[status] || null

  return (
    <div
      className="max-w-2xl mx-auto space-y-5"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >

      {/* ── Seletor de mês ───────────────────────────────────────── */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <h1
          className="font-display font-semibold"
          style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '22px', color: BROWN }}
        >
          Dados do Mês
        </h1>

        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />

        <div className="relative">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-body focus:outline-none"
            style={{
              background: '#ffffff',
              border: `1px solid ${BEIGE}`,
              color: DARK,
              boxShadow: '0 1px 4px rgba(41,41,41,0.05)',
            }}
            onFocus={e => { e.target.style.border = `1px solid ${GOLD}`; e.target.style.boxShadow = `0 0 0 3px rgba(199,170,137,0.2)` }}
            onBlur={e => { e.target.style.border = `1px solid ${BEIGE}`; e.target.style.boxShadow = '0 1px 4px rgba(41,41,41,0.05)' }}
          >
            {months.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: `${DARK}40` }} />
        </div>

        {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Seguidores ───────────────────────────────────────── */}
          <div className="animate-fade-in-up-delay-1">
            <SectionCard title={`Seguidores — ${formatMonth(selectedMonth)}`}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Seguidores (mês anterior)"
                  type="number"
                  value={followersPreviousStr}
                  onChange={e => setFollowersPrevious(e.target.value)}
                  min={0}
                />
                <Input
                  label="Seguidores (atual)"
                  type="number"
                  value={followersCurrentStr}
                  onChange={e => setFollowersCurrent(e.target.value)}
                  min={0}
                />
              </div>
              {followersCurrentStr && followersPreviousStr && (
                <div
                  className="mt-4 p-3 rounded-xl"
                  style={{ background: 'rgba(199,170,137,0.08)', border: `1px solid rgba(199,170,137,0.20)` }}
                >
                  <p className="text-sm font-body" style={{ color: `${MID}90` }}>
                    Crescimento:{' '}
                    <span className="font-semibold" style={{ color: GOLD_DARK }}>
                      +{formatNumber(Number(followersCurrentStr) - Number(followersPreviousStr))} seguidores
                    </span>
                  </p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Faturamento ──────────────────────────────────────── */}
          <div className="animate-fade-in-up-delay-2">
            <SectionCard
              title="Faturamento"
              subtitle="Seus dados de faturamento são confidenciais e nunca aparecem para outras mentoradas."
              badge={<Badge variant="default">🔒 Privado</Badge>}
            >
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Faturamento (mês anterior)"
                  type="number"
                  value={revenuePreviousStr}
                  onChange={e => setRevenuePrevious(e.target.value)}
                  min={0}
                  step="0.01"
                />
                <Input
                  label="Faturamento (atual)"
                  type="number"
                  value={revenueCurrentStr}
                  onChange={e => setRevenueCurrent(e.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>
            </SectionCard>
          </div>

          {/* ── Upload comprovante ───────────────────────────────── */}
          <div className="animate-fade-in-up-delay-3">
            <SectionCard title="Comprovante (print)">
              {printPreview || submission?.instagram_proof_image ? (
                <div className="relative group">
                  <img
                    src={printPreview || `/uploads/proofs/${submission?.instagram_proof_image}`}
                    alt="Comprovante"
                    className="w-full max-h-48 object-cover rounded-xl"
                    style={{ border: `1px solid ${BEIGE}` }}
                  />
                  {printPreview && (
                    <button
                      type="button"
                      onClick={() => { setPrintFile(null); setPrintPreview('') }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg transition-colors"
                      style={{ background: 'rgba(41,41,41,0.7)', color: '#ffffff' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: dragging ? GOLD : BEIGE,
                    background: dragging ? 'rgba(199,170,137,0.06)' : 'rgba(246,242,231,0.5)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(199,170,137,0.12)' }}
                  >
                    <Upload size={20} style={{ color: GOLD }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-body font-medium" style={{ color: DARK }}>
                      Arraste ou clique para enviar
                    </p>
                    <p className="text-xs font-body mt-0.5" style={{ color: `${DARK}40` }}>
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
                onChange={e => handleFile(e.target.files?.[0])}
              />
            </SectionCard>
          </div>

          {/* ── Feedback ─────────────────────────────────────────── */}
          {success && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl animate-fade-in-up"
              style={{
                background: 'rgba(74,140,80,0.07)',
                border: '1px solid rgba(74,140,80,0.20)',
              }}
            >
              <CheckCircle size={16} style={{ color: '#3a8040', flexShrink: 0 }} />
              <p className="text-sm font-body font-medium" style={{ color: '#3a8040' }}>
                Dados enviados com sucesso! Aguardando validação.
              </p>
            </div>
          )}
          {error && (
            <div
              className="p-4 rounded-xl"
              style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.20)' }}
            >
              <p className="text-sm font-body" style={{ color: '#c0392b' }}>{error}</p>
            </div>
          )}

          {/* ── Botão submit ─────────────────────────────────────── */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-body font-semibold text-sm transition-all duration-300 relative overflow-hidden"
            style={{
              background: saving ? MID : BROWN,
              color: CREAM,
              letterSpacing: '0.06em',
              boxShadow: saving ? 'none' : '0 4px 16px rgba(61,40,28,0.25)',
            }}
            onMouseEnter={e => {
              if (!saving) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8e7028, #ab9051, #f2ea9c, #ab9051, #8e7028)'
                e.currentTarget.style.color = BROWN
              }
            }}
            onMouseLeave={e => {
              if (!saving) {
                e.currentTarget.style.background = BROWN
                e.currentTarget.style.color = CREAM
              }
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Salvando…
              </span>
            ) : (
              submission ? 'Atualizar Dados' : 'Enviar Dados'
            )}
          </button>
        </form>
      )}

      {/* ── Histórico ────────────────────────────────────────────── */}
      {!histLoading && history.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden animate-fade-in-up-delay-4"
          style={{
            background: '#ffffff',
            border: `1px solid rgba(216,209,193,0.6)`,
            boxShadow: '0 2px 12px rgba(41,41,41,0.05)',
          }}
        >
          <div className="px-6 py-4" style={{ borderBottom: `1px solid rgba(216,209,193,0.4)` }}>
            <h3
              className="font-display font-semibold"
              style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '16px', color: BROWN }}
            >
              Histórico
            </h3>
          </div>
          <div className="px-6 py-4 overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(216,209,193,0.4)` }}>
                  {['Mês', 'Seguidores', 'Crescimento', 'Status'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2 font-semibold uppercase ${i > 0 ? 'text-right' : 'text-left'}`}
                      style={{ fontSize: '10px', letterSpacing: '0.15em', color: `${GOLD}90` }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(m => {
                  const gained = (m.followers_count || 0) - (m.followers_previous || 0)
                  const mStatus = m.validated_by_admin === 1 ? 'approved'
                                : m.validated_by_admin === 2 ? 'rejected'
                                : 'pending'
                  const s = statusConfig[mStatus]
                  return (
                    <tr key={m.month} style={{ borderBottom: `1px solid rgba(216,209,193,0.2)` }}>
                      <td className="py-2.5 font-medium" style={{ color: DARK }}>{formatMonth(m.month)}</td>
                      <td className="py-2.5 text-right" style={{ color: `${DARK}70` }}>
                        {formatNumber(m.followers_count || 0)}
                      </td>
                      <td
                        className="py-2.5 text-right font-medium"
                        style={{ color: gained >= 0 ? '#3a8040' : '#c0392b' }}
                      >
                        {gained >= 0 ? '+' : ''}{formatNumber(gained)}
                      </td>
                      <td className="py-2.5 text-right">
                        {s ? <Badge variant={s.variant}>{s.label}</Badge> : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
