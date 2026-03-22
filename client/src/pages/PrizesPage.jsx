import { useCallback } from 'react'
import { Trophy, Medal, Award, CheckSquare, TrendingUp, DollarSign } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { prizesApi } from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

/* ─── Paleta da marca ───────────────────────────────────────────────── */
const GOLD_GRADIENT = 'linear-gradient(135deg, #8e7028, #ab9051, #f2ea9c, #ab9051, #8e7028)'
const GOLD_SOFT     = '#C7AA89'
const BROWN_DARK    = '#3D281C'
const BROWN_MID     = '#604E44'
const CREAM         = '#F6F2E7'
const BEIGE         = '#D8D1C1'
const DARK          = '#292929'

/* ─── Configuração de cada posição ─────────────────────────────────── */
const positionConfig = [
  {
    position: 1,
    icon: Trophy,
    label: '1º Lugar',
    rankLabel: '01',
    accentColor: GOLD_SOFT,
    accentGradient: GOLD_GRADIENT,
    badgeBg: GOLD_GRADIENT,
    badgeText: '#3D281C',
    glow: '0 12px 48px rgba(199,170,137,0.30), 0 4px 16px rgba(142,112,40,0.15)',
    borderTop: `3px solid transparent`,
    borderImage: `${GOLD_GRADIENT} 1`,
    metalLabel: 'Ouro',
    delay: 0,
  },
  {
    position: 2,
    icon: Medal,
    label: '2º Lugar',
    rankLabel: '02',
    accentColor: '#B8B4AE',
    accentGradient: 'linear-gradient(135deg, #9a9690, #d4d0ca, #f0ede8, #d4d0ca, #9a9690)',
    badgeBg: 'linear-gradient(135deg, #9a9690, #c8c4be)',
    badgeText: '#ffffff',
    glow: '0 8px 32px rgba(184,180,174,0.20)',
    metalLabel: 'Prata',
    delay: 150,
  },
  {
    position: 3,
    icon: Award,
    label: '3º Lugar',
    rankLabel: '03',
    accentColor: '#b08060',
    accentGradient: 'linear-gradient(135deg, #7a5530, #b08060, #d4a870, #b08060, #7a5530)',
    badgeBg: 'linear-gradient(135deg, #7a5530, #b08060)',
    badgeText: '#F6F2E7',
    glow: '0 8px 32px rgba(176,128,96,0.18)',
    metalLabel: 'Bronze',
    delay: 300,
  },
]

/* ─── Métricas de ranking ───────────────────────────────────────────── */
const metrics = [
  {
    Icon: CheckSquare,
    title: 'Checklist',
    desc: 'Quanto do checklist mensal você completou.',
  },
  {
    Icon: TrendingUp,
    title: 'Seguidores',
    desc: 'Novos seguidores comparados ao mês anterior.',
  },
  {
    Icon: DollarSign,
    title: 'Faturamento',
    desc: 'Crescimento percentual do seu faturamento (privado).',
  },
]

/* ─── Ornamento dourado ─────────────────────────────────────────────── */
function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD_SOFT}60)` }}
      />
      <span style={{ color: `${GOLD_SOFT}80`, fontSize: '10px', letterSpacing: '0.2em' }}>✦</span>
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(90deg, ${GOLD_SOFT}60, transparent)` }}
      />
    </div>
  )
}

/* ─── Card de prêmio ────────────────────────────────────────────────── */
function PrizeCard({ config, prize }) {
  const Icon = config.icon

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(41,41,41,0.07)',
        boxShadow: config.glow,
        animationDelay: `${config.delay}ms`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = config.glow.replace(/0\.30/, '0.45').replace(/0\.20/, '0.35').replace(/0\.18/, '0.30')
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = config.glow
      }}
    >
      {/* Barra superior metálica */}
      <div
        className="w-full"
        style={{ height: '3px', background: config.accentGradient }}
      />

      {/* Cabeçalho do card */}
      <div
        className="px-7 pt-7 pb-5"
        style={{ borderBottom: `1px solid rgba(41,41,41,0.05)` }}
      >
        <div className="flex items-start justify-between mb-5">
          {/* Número da posição — tipografia grande elegante */}
          <span
            className="font-display leading-none select-none"
            style={{
              fontSize: '72px',
              fontStyle: 'italic',
              color: `${config.accentColor}18`,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {config.rankLabel}
          </span>

          {/* Badge metálico */}
          <div
            className="flex flex-col items-center justify-center rounded-xl px-3 py-2"
            style={{
              background: config.badgeBg,
              minWidth: '56px',
            }}
          >
            <Icon
              size={18}
              strokeWidth={1.8}
              style={{ color: config.badgeText, opacity: 0.9 }}
            />
            <span
              className="font-body font-semibold mt-1"
              style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                color: config.badgeText,
                textTransform: 'uppercase',
              }}
            >
              {config.metalLabel}
            </span>
          </div>
        </div>

        {/* Label da posição */}
        <div>
          <p
            className="font-body font-semibold uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              color: config.accentColor,
            }}
          >
            {config.label}
          </p>
          <GoldDivider className="mt-2" />
        </div>
      </div>

      {/* Conteúdo do prêmio */}
      <div className="px-7 py-6 flex-1 flex flex-col justify-center min-h-[120px]">
        {prize?.title ? (
          <>
            <h3
              className="font-display font-semibold leading-snug mb-3"
              style={{ fontSize: '18px', color: DARK }}
            >
              {prize.title}
            </h3>
            {prize.description && (
              <p
                className="font-body leading-relaxed"
                style={{ fontSize: '13px', color: `${BROWN_MID}99` }}
              >
                {prize.description}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <p
              className="font-display italic"
              style={{ fontSize: '15px', color: `${GOLD_SOFT}70`, letterSpacing: '0.04em' }}
            >
              A ser revelado em breve
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  style={{
                    width: '4px', height: '4px',
                    borderRadius: '50%',
                    background: `${GOLD_SOFT}50`,
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detalhe de canto decorativo */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
        style={{
          background: `radial-gradient(circle at bottom right, ${config.accentColor}12, transparent 70%)`,
        }}
      />
    </div>
  )
}

/* ─── Página principal ──────────────────────────────────────────────── */
export default function PrizesPage() {
  const fn = useCallback(() => prizesApi.getPrizes(), [])
  const { data, loading } = useApi(fn)

  const prizes = data?.prizes || []

  return (
    <div
      className="max-w-4xl mx-auto"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {/* ── Header da página ─────────────────────────────────────────── */}
      <div
        className="text-center rounded-2xl px-8 py-10 mb-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${CREAM} 0%, #ffffff 60%, ${CREAM} 100%)`,
          border: `1px solid rgba(199,170,137,0.15)`,
        }}
      >
        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative z-10">
          {/* Ornamento superior */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div
              className="h-px"
              style={{
                width: '48px',
                background: `linear-gradient(90deg, transparent, ${GOLD_SOFT}60)`,
              }}
            />
            <span style={{ color: `${GOLD_SOFT}70`, fontSize: '11px', letterSpacing: '0.3em' }}>
              ✦ ✦ ✦
            </span>
            <div
              className="h-px"
              style={{
                width: '48px',
                background: `linear-gradient(90deg, ${GOLD_SOFT}60, transparent)`,
              }}
            />
          </div>

          {/* Título */}
          <h1
            className="font-display font-semibold leading-tight mb-3"
            style={{
              fontFamily: 'Bride, Georgia, serif',
              fontSize: '36px',
              color: BROWN_DARK,
              letterSpacing: '-0.01em',
            }}
          >
            Premiações
          </h1>

          {/* Subtítulo */}
          <p
            className="font-body mx-auto"
            style={{
              fontSize: '14px',
              color: `${BROWN_MID}90`,
              maxWidth: '380px',
              lineHeight: '1.7',
              letterSpacing: '0.02em',
            }}
          >
            As mentoradas com melhor desempenho ao final de cada mês
            são celebradas e premiadas. Dê o seu melhor em cada etapa.
          </p>

          {/* Ornamento inferior */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <div
              className="h-px"
              style={{
                width: '32px',
                background: `linear-gradient(90deg, transparent, ${GOLD_SOFT}40)`,
              }}
            />
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: `${GOLD_SOFT}50`,
              }}
            >
              Mentoria Sublime
            </span>
            <div
              className="h-px"
              style={{
                width: '32px',
                background: `linear-gradient(90deg, ${GOLD_SOFT}40, transparent)`,
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <>
          {/* ── Grid de prêmios ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {positionConfig.map(config => {
              const prize = prizes.find(p => p.position === config.position)
              return (
                <PrizeCard
                  key={config.position}
                  config={config}
                  prize={prize}
                />
              )
            })}
          </div>

          {/* ── Como o ranking funciona ──────────────────────────────── */}
          <div
            className="rounded-2xl p-7"
            style={{
              background: CREAM,
              border: `1px solid ${BEIGE}`,
            }}
          >
            {/* Cabeçalho da seção */}
            <div className="mb-6">
              <p
                className="font-body font-semibold uppercase mb-2"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  color: `${GOLD_SOFT}90`,
                }}
              >
                Como funciona
              </p>
              <h3
                className="font-display font-semibold"
                style={{
                  fontFamily: 'Bride, Georgia, serif',
                  fontSize: '20px',
                  color: BROWN_DARK,
                }}
              >
                Cálculo do Ranking
              </h3>
              <GoldDivider className="mt-3" />
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {metrics.map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  {/* Ícone */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `rgba(199,170,137,0.12)`,
                      border: `1px solid rgba(199,170,137,0.25)`,
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.6}
                      style={{ color: GOLD_SOFT }}
                    />
                  </div>
                  {/* Texto */}
                  <div>
                    <p
                      className="font-body font-semibold mb-1"
                      style={{ fontSize: '13px', color: DARK }}
                    >
                      {title}
                    </p>
                    <p
                      className="font-body leading-relaxed"
                      style={{ fontSize: '12px', color: `${BROWN_MID}80` }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
