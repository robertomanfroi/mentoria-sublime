import { useState, useCallback } from 'react'
import { ChevronDown, Info, Trophy, Medal, Award } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'
import { rankingApi, prizesApi } from '../lib/api'
import { getCurrentMonth, getLastNMonths, formatMonth } from '../lib/utils'
import PodiumCard from '../components/ranking/PodiumCard'
import RankingRow from '../components/ranking/RankingRow'
import LoadingSpinner from '../components/ui/LoadingSpinner'

/* ─── Paleta oficial ──────────────────────────────────────────────────── */
const GOLD   = '#C7AA89'
const BROWN  = '#3D281C'
const MID    = '#604E44'
const CREAM  = '#F6F2E7'
const BEIGE  = '#D8D1C1'
const DARK   = '#292929'

const prizeIcons  = { 1: Trophy, 2: Medal, 3: Award }
const prizeColors = {
  1: '#8e7028',        // dourado escuro
  2: '#9a9690',        // prata
  3: '#9a7060',        // bronze/caramelo
}

const months = getLastNMonths(6)

export default function RankingPage() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  const fn      = useCallback(() => rankingApi.getRanking(selectedMonth), [selectedMonth])
  const { data, loading } = useApi(fn)

  const prizesFn = useCallback(() => prizesApi.getPrizes(), [])
  const { data: prizesData } = useApi(prizesFn)
  const prizes = Array.isArray(prizesData) ? prizesData : []

  const entries = Array.isArray(data) ? data : (data?.ranking || [])
  const top3 = entries.slice(0, 3)
  const rest  = entries.slice(3)

  return (
    <div
      className="max-w-3xl mx-auto space-y-6"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >

      {/* ── Header + Seletor de mês ──────────────────────────────────── */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <h1
          className="font-display font-semibold"
          style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '22px', color: BROWN }}
        >
          Ranking
        </h1>

        {/* Ornamento */}
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />

        {/* Select de mês com estilo da marca */}
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
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: `${DARK}40` }}
          />
        </div>
      </div>

      {/* ── Nota de privacidade ───────────────────────────────────────── */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl animate-fade-in-up-delay-1"
        style={{
          background: `rgba(246,242,231,0.8)`,
          border: `1px solid ${BEIGE}`,
        }}
      >
        <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: `${GOLD}` }} />
        <p className="text-xs font-body" style={{ color: `${MID}90`, lineHeight: '1.6' }}>
          Faturamento é privado — apenas a posição no ranking é exibida.
          As estrelas indicam desempenho em checklist, crescimento de seguidores e faturamento.
        </p>
      </div>

      {/* ── Premiação ─────────────────────────────────────────────────── */}
      {prizes.length > 0 && (
        <div
          className="rounded-2xl p-5 animate-fade-in-up-delay-1"
          style={{
            background: '#ffffff',
            border: `1px solid rgba(199,170,137,0.2)`,
            boxShadow: '0 2px 12px rgba(199,170,137,0.10)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={16} style={{ color: GOLD }} />
            <h2
              className="font-display font-semibold"
              style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '16px', color: BROWN }}
            >
              Premiação
            </h2>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
          </div>

          <div className="space-y-3">
            {prizes.map(prize => {
              const Icon = prizeIcons[prize.position]
              const color = prizeColors[prize.position]
              const labels = { 1: '1º Lugar', 2: '2º Lugar', 3: '3º Lugar' }
              return (
                <div key={prize.id} className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15` }}
                  >
                    {Icon && <Icon size={14} style={{ color }} />}
                  </div>
                  <div>
                    <p className="text-sm font-body font-semibold" style={{ color: DARK }}>
                      {labels[prize.position]} — {prize.title}
                    </p>
                    {prize.description && (
                      <p className="text-xs font-body mt-0.5" style={{ color: `${MID}80` }}>
                        {prize.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner centered />
      ) : entries.length === 0 ? (
        /* ── Estado vazio ──────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: CREAM, border: `1px solid ${BEIGE}` }}
          >
            <Trophy size={28} style={{ color: GOLD }} />
          </div>
          <h3
            className="font-display font-semibold mb-2"
            style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '20px', color: BROWN }}
          >
            Ranking não calculado
          </h3>
          <p className="font-body text-sm" style={{ color: `${MID}80`, maxWidth: '260px' }}>
            O ranking de {formatMonth(selectedMonth)} ainda não foi calculado.
            Aguarde o admin processar os dados.
          </p>
        </div>
      ) : (
        <>
          {/* ── Pódio ──────────────────────────────────────────────── */}
          {top3.length > 0 && (
            <div className="animate-fade-in-up-delay-2">
              <p
                className="font-body text-center mb-6 font-medium uppercase tracking-widest"
                style={{ fontSize: '11px', color: `${GOLD}90` }}
              >
                Pódio — {formatMonth(selectedMonth)}
              </p>
              <div className="flex items-end justify-center gap-4 px-4">
                {top3[1] && <PodiumCard entry={top3[1]} position={2} />}
                {top3[0] && <PodiumCard entry={top3[0]} position={1} />}
                {top3[2] && <PodiumCard entry={top3[2]} position={3} />}
              </div>
            </div>
          )}

          {/* ── Lista completa ─────────────────────────────────────── */}
          {rest.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden animate-fade-in-up-delay-3"
              style={{
                background: '#ffffff',
                border: `1px solid ${BEIGE}`,
                boxShadow: '0 2px 12px rgba(41,41,41,0.05)',
              }}
            >
              {/* Cabeçalho da tabela */}
              <div
                className="px-5 py-3"
                style={{ borderBottom: `1px solid rgba(216,209,193,0.4)` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-body font-semibold uppercase"
                    style={{ fontSize: '10px', letterSpacing: '0.18em', color: `${GOLD}80` }}
                  >
                    Mentorada
                  </span>
                  <div
                    className="flex items-center gap-8 pr-2 font-body font-semibold uppercase"
                    style={{ fontSize: '10px', letterSpacing: '0.18em', color: `${GOLD}80` }}
                  >
                    <span className="hidden sm:block">Seguidores</span>
                    <span className="hidden md:block">Estrelas</span>
                    <span>Score</span>
                  </div>
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                {rest.map((entry, idx) => (
                  <RankingRow
                    key={entry.user_id || idx}
                    entry={entry}
                    position={entry.position || idx + 4}
                    isCurrentUser={entry.user_id === user?.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
