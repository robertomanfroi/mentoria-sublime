import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import Card from '../ui/Card'

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

  return (
    <Card
      variant={variant}
      className={cn(
        'animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
          {Icon && <Icon size={20} className="text-gold" />}
        </div>

        {/* Variation badge */}
        {variation !== undefined && variation !== null && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-body font-medium',
              isPositive && 'bg-sage/10 text-sage',
              isNegative && 'bg-red-50 text-red-500',
              !isPositive && !isNegative && 'bg-nude-medium/40 text-dark/50'
            )}
          >
            {isPositive ? (
              <TrendingUp size={11} />
            ) : isNegative ? (
              <TrendingDown size={11} />
            ) : null}
            {isPositive ? '+' : ''}
            {variation?.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl font-display font-bold text-dark">{value}</p>
        <p className="text-sm font-body text-dark/50 mt-0.5">{label}</p>
        {variationLabel && (
          <p className="text-xs font-body text-dark/40 mt-0.5">{variationLabel}</p>
        )}
      </div>
    </Card>
  )
}
