import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy,
  CheckSquare,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'
import { checklistApi, rankingApi, monthlyApi } from '../lib/api'
import { getCurrentMonth, formatMonth, formatNumber, growthPercent } from '../lib/utils'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import StatCard from '../components/dashboard/StatCard'
import MiniChart from '../components/dashboard/MiniChart'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { RankBadge } from '../components/ui/Badge'

const currentMonth = getCurrentMonth()

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const progressFn = useCallback(() => checklistApi.getProgress(), [])
  const rankingFn = useCallback(() => rankingApi.getMyPosition(currentMonth), [])
  const historyFn = useCallback(() => monthlyApi.getHistory(), [])

  const { data: progress, loading: loadingProgress } = useApi(progressFn)
  const { data: myRank, loading: loadingRank } = useApi(rankingFn)
  const { data: history, loading: loadingHistory } = useApi(historyFn)

  const checklistPct = progress?.percentage ?? 0
  const completed = progress?.completed ?? 0
  const total = progress?.total ?? 96
  const position = myRank?.position
  const score = myRank?.total_score

  // Histórico de seguidores para o chart (API retorna array direto)
  const historyArr = Array.isArray(history) ? history : []
  const chartData = historyArr
    .slice()
    .reverse()
    .map((m) => ({
      month: m.month,
      followers: m.followers_count || 0,
    }))

  // Crescimento do mês atual
  const currentMonthData = historyArr[0]
  const followersGained = currentMonthData
    ? (currentMonthData.followers_count || 0) - (currentMonthData.followers_previous || 0)
    : null
  const followersGrowthPct = currentMonthData
    ? growthPercent(
        currentMonthData.followers_count || 0,
        currentMonthData.followers_previous || 0
      )
    : null

  const isTop3 = position && position <= 3

  const loading = loadingProgress || loadingRank || loadingHistory

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho de boas-vindas */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Avatar
          src={user?.avatar_url}
          name={user?.name}
          size="xl"
          gold={isTop3}
          pulse={position === 1}
        />
        <div>
          <p className="text-sm font-body text-dark/50 mb-0.5">
            {formatMonth(currentMonth)}
          </p>
          <h1 className="font-display text-2xl font-bold text-dark leading-tight">
            Olá, {user?.name?.split(' ')[0]}!
          </h1>
          {user?.instagram && (
            <p className="text-sm font-body text-dark/50">@{user.instagram}</p>
          )}
          {position && (
            <div className="flex items-center gap-2 mt-1.5">
              <RankBadge position={position} size="sm" />
              <span className="text-sm font-body text-dark/60">
                {position === 1
                  ? 'Você está em 1º lugar!'
                  : `${position}ª posição no ranking`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mensagem motivacional para top 3 */}
      {isTop3 && (
        <div className="flex items-center gap-3 p-4 bg-gold/10 border border-gold/30 rounded-2xl animate-fade-in-up-delay-1">
          <Sparkles size={20} className="text-gold flex-shrink-0" />
          <p className="font-body text-sm text-dark">
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
          {/* Grid de stats */}
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
              <Card className="col-span-2 lg:col-span-1 animate-fade-in-up-delay-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-gold" />
                  <p className="text-sm font-body text-dark/50">Seguidores</p>
                </div>
                <p className="text-sm font-body text-dark/40 italic">
                  Adicione seus dados do mês
                </p>
              </Card>
            )}
          </div>

          {/* Progresso do checklist */}
          <Card className="animate-fade-in-up-delay-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-dark">
                Progresso do Checklist
              </h3>
              <span className="text-sm font-body text-dark/50">
                {completed} de {total} itens
              </span>
            </div>
            <ProgressBar value={checklistPct} showPercent size="lg" />
            <p className="mt-2 text-xs font-body text-dark/40">
              {checklistPct >= 60
                ? '⭐ Parabéns! Você atingiu a estrela dourada no checklist!'
                : checklistPct >= 25
                ? 'Continue! Falta pouco para a estrela dourada (60%).'
                : 'Complete pelo menos 25% para ganhar sua primeira estrela.'}
            </p>
          </Card>

          {/* Histórico de seguidores */}
          {chartData.length > 0 && (
            <Card className="animate-fade-in-up-delay-3">
              <h3 className="font-display text-base font-semibold text-dark mb-4">
                Evolução de Seguidores
              </h3>
              <MiniChart data={chartData} />
            </Card>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/monthly')}
              className="flex-1 justify-center gap-2"
            >
              <Calendar size={16} />
              Atualizar Dados do Mês
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/checklist')}
              className="flex-1 justify-center gap-2"
            >
              <CheckSquare size={16} />
              Ir para Checklist
              <ArrowRight size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
