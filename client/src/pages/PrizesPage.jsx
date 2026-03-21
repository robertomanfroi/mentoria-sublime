import { useCallback } from 'react'
import { Trophy, Medal, Award, Gift } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { prizesApi } from '../lib/api'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { cn } from '../lib/utils'

const positionConfig = [
  {
    position: 1,
    icon: Trophy,
    label: '1º Lugar',
    gradient: 'from-gold/20 to-amber-100',
    border: 'border-gold/40',
    iconColor: 'text-gold',
    badge: 'bg-gradient-to-br from-gold to-amber-400 text-white',
    crown: '👑',
  },
  {
    position: 2,
    icon: Medal,
    label: '2º Lugar',
    gradient: 'from-slate-100 to-slate-200',
    border: 'border-slate-300',
    iconColor: 'text-slate-500',
    badge: 'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
    crown: '🥈',
  },
  {
    position: 3,
    icon: Award,
    label: '3º Lugar',
    gradient: 'from-amber-100 to-amber-200',
    border: 'border-amber-700/30',
    iconColor: 'text-amber-700',
    badge: 'bg-gradient-to-br from-amber-700 to-amber-800 text-white',
    crown: '🥉',
  },
]

function PrizeCard({ config, prize, index }) {
  const Icon = config.icon

  return (
    <div
      className={cn(
        'relative flex flex-col items-center text-center p-8 rounded-2xl border',
        'bg-gradient-to-b shadow-soft',
        'transition-all duration-300 hover:shadow-card hover:-translate-y-1',
        'animate-fade-in-up',
        config.gradient,
        config.border
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Badge de posição */}
      <div
        className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md',
          config.badge
        )}
      >
        <Icon size={22} strokeWidth={2} />
      </div>

      {/* Emoji decorativo */}
      <div className="text-4xl mb-3">{config.crown}</div>

      {/* Label da posição */}
      <h2 className="font-display text-xl font-bold text-dark mb-1">
        {config.label}
      </h2>

      {/* Título do prêmio */}
      {prize?.title ? (
        <>
          <h3 className="font-display text-lg font-semibold text-dark/80 mt-3 mb-2">
            {prize.title}
          </h3>
          <p className="font-body text-sm text-dark/60 leading-relaxed max-w-xs">
            {prize.description}
          </p>
        </>
      ) : (
        <p className="font-body text-sm text-dark/40 mt-4 italic">
          Prêmio a ser anunciado em breve...
        </p>
      )}
    </div>
  )
}

export default function PrizesPage() {
  const fn = useCallback(() => prizesApi.getPrizes(), [])
  const { data, loading } = useApi(fn)

  const prizes = data?.prizes || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Gift size={24} className="text-gold" />
          <h1 className="font-display text-3xl font-bold text-dark">
            Premiações
          </h1>
        </div>
        <p className="font-body text-dark/50 max-w-lg mx-auto">
          As mentoradas com melhor desempenho ao final do mês são premiadas.
          Dê o seu melhor em cada etapa!
        </p>
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <>
          {/* Cards de prêmio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {positionConfig.map((config, idx) => {
              const prize = prizes.find((p) => p.position === config.position)
              return (
                <PrizeCard
                  key={config.position}
                  config={config}
                  prize={prize}
                  index={idx}
                />
              )
            })}
          </div>

          {/* Seção de como funciona */}
          <Card variant="nude" className="animate-fade-in-up-delay-3">
            <h3 className="font-display text-lg font-semibold text-dark mb-4">
              Como o ranking é calculado?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  emoji: '✅',
                  title: 'Checklist',
                  desc: 'Quanto do checklist você completou neste mês.',
                },
                {
                  emoji: '📈',
                  title: 'Seguidores',
                  desc: 'Quantos seguidores você ganhou comparado ao mês anterior.',
                },
                {
                  emoji: '💰',
                  title: 'Faturamento',
                  desc: 'Percentual de crescimento do seu faturamento (privado).',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-body font-semibold text-dark text-sm">{item.title}</p>
                    <p className="font-body text-xs text-dark/50 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
