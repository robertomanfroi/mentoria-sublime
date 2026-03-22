import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy, CheckSquare, TrendingUp, Calendar, Sparkles, ArrowRight,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'
import { checklistApi, rankingApi, monthlyApi } from '../lib/api'
import { getCurrentMonth, formatMonth, formatNumber, growthPercent } from '../lib/utils'
import Avatar from '../components/ui/Avatar'
import ProgressBar from '../components/ui/ProgressBar'
import StatCard from '../components/dashboard/StatCard'
import MiniChart from '../components/dashboard/MiniChart'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RankBadge } from '../components/ui/Badge'

/* ─── Paleta oficial ──────────────────────────────────────────────────── */
const GOLD   = '#C7AA89'
const GOLD_DARK = '#8e7028'
const BROWN  = '#3D281C'
const MID    = '#604E44'
const CREAM  = '#F6F2E7'
const BEIGE  = '#D8D1C1'
const DARK   = '#292929'

const currentMonth = getCurrentMonth()

export default function DashboardPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const progressFn = useCallback(() => checklistApi.getProgress(), [])
  const rankingFn  = useCallback(() => rankingApi.getMyPosition(currentMonth), [])
  const historyFn  = useCallback(() => monthlyApi.getHistory(), [])

  const { data: progress,  loading: loadingProgress } = useApi(progressFn)
  const { data: myRank,    loading: loadingRank }     = useApi(rankingFn)
  const { data: history,   loading: loadingHistory }  = useApi(historyFn)

  const checklistPct  = progress?.percentage ?? 0
  const completed     = progress?.completed ?? 0
  const total         = progress?.total ?? 96
  const position      = myRank?.position
  const isTop3        = position && position <= 3
  const loading       = loadingProgress || loadingRank || loadingHistory

  const historyArr = Array.isArray(history) ? history : []
  const chartData  = historyArr.slice().reverse().map(m => ({
    month: m.month,
    followers: m.followers_count || 0,
  }))

  const currentMonthData   = historyArr[0]
  const followersGained    = currentMonthData
    ? (currentMonthData.followers_count || 0) - (currentMonthData.followers_previous || 0)
    : null
  const followersGrowthPct = currentMonthData
    ? growthPercent(currentMonthData.followers_count || 0, currentMonthData.followers_previous || 0)
    : null

  return (
    <div
      className="max-w-4xl mx-auto space-y-6"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >

      {/* ── Cabeçalho de boas-vindas ─────────────────────────────── */}
      <div
        className="flex items-center gap-5 p-5 rounded-2xl animate-fade-in-up"
        style={{
          background: 'linear-gradient(160deg, rgba(199,170,137,0.07) 0%, #ffffff 70%)',
          border: `1px solid rgba(199,170,137,0.18)`,
          boxShadow: '0 2px 12px rgba(41,41,41,0.05)',
        }}
      >
        <Avatar
          src={user?.avatar_url}
          name={user?.name}
          size="xl"
          gold={isTop3}
          pulse={position === 1}
        />
        <div className="flex-1 min-w-0">
          <p
            className="font-body mb-0.5"
            style={{ fontSize: '12px', color: `${MID}80`, letterSpacing: '0.04em' }}
          >
            {formatMonth(currentMonth)}
          </p>
          <h1
            className="font-display font-semibold leading-tight"
            style={{
              fontFamily: 'Bride, Georgia, serif',
              fontSize: '24px',
              color: BROWN,
            }}
          >
            Olá, {user?.name?.split(' ')[0]}!
          </h1>
          {user?.instagram && (
            <p className="font-body mt-0.5" style={{ fontSize: '12px', color: `${GOLD}` }}>
              @{user.instagram}
            </p>
          )}
          {position && (
            <div className="flex items-center gap-2 mt-2">
              <RankBadge position={position} size="sm" />
              <span className="font-body text-sm" style={{ color: `${DARK}60` }}>
                {position === 1
                  ? 'Você está em 1º lugar!'
                  : `${position}ª posição no ranking`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Banner top 3 ─────────────────────────────────────────── */}
      {isTop3 && (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl animate-fade-in-up-delay-1"
          style={{
            background: 'rgba(142,112,40,0.07)',
            border: `1px solid rgba(199,170,137,0.30)`,
          }}
        >
          <Sparkles size={18} style={{ color: GOLD, flexShrink: 0 }} />
          <p className="font-body text-sm" style={{ color: MID }}>
            {position === 1
              ? 'Incrível! Você está liderando o ranking este mês. Continue assim!'
              : position === 2
              ? 'Parabéns! Você está em 2º lugar. Um pouco mais e alcança o topo!'
              : 'Ótimo trabalho! Você está no pódio em 3º lugar. Continue avançando!'}
          </p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <>
          {/* ── Grid de stats ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Trophy}
              label="Posição no ranking"
              value={position ? `${position}º` : '—'}
              variant={isTop3 ? 'gold' : 'default'}
              delay={0}
            />
            <StatCard
              icon={CheckSquare}
              label="Checklist concluído"
              value={`${checklistPct}%`}
              variation={null}
              delay={100}
            />
            {followersGained !== null ? (
              <StatCard
                icon={TrendingUp}
                label="Seguidores ganhos"
                value={`+${formatNumber(followersGained)}`}
                variation={followersGrowthPct}
                variationLabel="vs. mês anterior"
                className="col-span-2 lg:col-span-1"
                delay={200}
              />
            ) : (
              <div
                className="col-span-2 lg:col-span-1 rounded-2xl p-5 animate-fade-in-up-delay-2"
                style={{
                  background: '#ffffff',
                  border: `1px solid rgba(216,209,193,0.7)`,
                  boxShadow: '0 2px 12px rgba(41,41,41,0.05)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} style={{ color: GOLD }} />
                  <p className="text-sm font-body" style={{ color: `${DARK}50` }}>Seguidores</p>
                </div>
                <p className="text-sm font-body italic" style={{ color: `${DARK}35` }}>
                  Adicione seus dados do mês
                </p>
              </div>
            )}
          </div>

          {/* ── Progresso do checklist ─────────────────────────────── */}
          <div
            className="rounded-2xl p-5 animate-fade-in-up-delay-2"
            style={{
              background: '#ffffff',
              border: `1px solid rgba(216,209,193,0.6)`,
              boxShadow: '0 2px 12px rgba(41,41,41,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-display font-semibold"
                style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '16px', color: BROWN }}
              >
                Progresso do Checklist
              </h3>
              <span className="font-body text-sm" style={{ color: `${MID}70` }}>
                {completed} de {total} itens
              </span>
            </div>
            <ProgressBar value={checklistPct} showPercent size="lg" />
            <p className="mt-2 text-xs font-body" style={{ color: `${DARK}40` }}>
              {checklistPct >= 60
                ? '⭐ Parabéns! Você atingiu a estrela dourada no checklist!'
                : checklistPct >= 25
                ? 'Continue! Falta pouco para a estrela dourada (60%).'
                : 'Complete pelo menos 25% para ganhar sua primeira estrela.'}
            </p>
          </div>

          {/* ── Histórico de seguidores ────────────────────────────── */}
          {chartData.length > 0 && (
            <div
              className="rounded-2xl p-5 animate-fade-in-up-delay-3"
              style={{
                background: '#ffffff',
                border: `1px solid rgba(216,209,193,0.6)`,
                boxShadow: '0 2px 12px rgba(41,41,41,0.05)',
              }}
            >
              <h3
                className="font-display font-semibold mb-4"
                style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '16px', color: BROWN }}
              >
                Evolução de Seguidores
              </h3>
              <MiniChart data={chartData} />
            </div>
          )}

          {/* ── CTAs ───────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-4">
            {/* Botão primário */}
            <button
              onClick={() => navigate('/monthly')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-body font-semibold text-sm transition-all duration-200"
              style={{
                background: BROWN,
                color: CREAM,
                border: `1px solid ${BROWN}`,
                boxShadow: '0 2px 8px rgba(61,40,28,0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8e7028, #ab9051, #f2ea9c, #ab9051, #8e7028)'
                e.currentTarget.style.color = BROWN
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = BROWN
                e.currentTarget.style.color = CREAM
              }}
            >
              <Calendar size={16} />
              Atualizar Dados do Mês
            </button>

            {/* Botão ghost */}
            <button
              onClick={() => navigate('/checklist')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-body font-semibold text-sm transition-all duration-200"
              style={{
                background: 'transparent',
                color: MID,
                border: `1px solid ${GOLD}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(199,170,137,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <CheckSquare size={16} />
              Ir para Checklist
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
