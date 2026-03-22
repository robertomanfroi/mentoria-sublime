import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

/* ─── Paleta oficial Mentoria Sublime ─────────────────────────────────── */
const GOLD  = '#C7AA89'
const GOLD_DARK = '#8e7028'
const DARK  = '#292929'
const MID   = '#604E44'
const CREAM = '#F6F2E7'
const BEIGE = '#D8D1C1'
const BROWN = '#3D281C'

export default function StatCard({
  icon: Icon,
  label,
  value,
  variation,
  variationLabel,
  variant = 'default',
  className,
  delay = 0,
}) {
  const isPositive = variation > 0
  const isNegative = variation < 0

  const isGold = variant === 'gold'

  return (
    <div
      className={cn('rounded-2xl p-5 animate-fade-in-up transition-all duration-200', className)}
      style={{
        background: isGold
          ? `linear-gradient(160deg, rgba(199,170,137,0.10) 0%, #ffffff 70%)`
          : '#ffffff',
        border: isGold
          ? '1px solid rgba(199,170,137,0.40)'
          : `1px solid rgba(216,209,193,0.7)`,
        boxShadow: isGold
          ? '0 4px 24px rgba(199,170,137,0.18)'
          : '0 2px 12px rgba(41,41,41,0.05)',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between">
        {/* Ícone */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: isGold ? 'rgba(142,112,40,0.12)' : 'rgba(199,170,137,0.10)',
          }}
        >
          {Icon && (
            <Icon
              size={20}
              style={{ color: isGold ? GOLD_DARK : GOLD }}
            />
          )}
        </div>

        {/* Badge de variação */}
        {variation !== undefined && variation !== null && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-body font-medium"
            style={{
              background: isPositive
                ? 'rgba(74,140,80,0.10)'
                : isNegative
                ? 'rgba(192,57,43,0.08)'
                : 'rgba(216,209,193,0.5)',
              color: isPositive
                ? '#3a8040'
                : isNegative
                ? '#c0392b'
                : `${DARK}50`,
            }}
          >
            {isPositive ? <TrendingUp size={11} /> : isNegative ? <TrendingDown size={11} /> : null}
            {isPositive ? '+' : ''}{variation?.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mt-3">
        <p
          className="font-display font-bold leading-none"
          style={{
            fontSize: '26px',
            color: isGold ? GOLD_DARK : DARK,
            fontFamily: 'Bride, Georgia, serif',
          }}
        >
          {value}
        </p>
        <p
          className="font-body mt-1.5"
          style={{ fontSize: '12px', color: `${MID}90` }}
        >
          {label}
        </p>
        {variationLabel && (
          <p
            className="font-body mt-0.5"
            style={{ fontSize: '11px', color: `${DARK}35` }}
          >
            {variationLabel}
          </p>
        )}
      </div>
    </div>
  )
}
