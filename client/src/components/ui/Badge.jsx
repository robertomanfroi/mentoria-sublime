import { cn } from '../../lib/utils'
import { Crown, Medal } from 'lucide-react'

const rankStyles = {
  1: {
    bg: 'bg-gradient-to-br from-gold to-amber-400',
    text: 'text-white',
    shadow: 'shadow-[0_2px_8px_rgba(201,168,76,0.5)]',
    icon: Crown,
  },
  2: {
    bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
    text: 'text-white',
    shadow: 'shadow-[0_2px_8px_rgba(148,163,184,0.4)]',
    icon: Medal,
  },
  3: {
    bg: 'bg-gradient-to-br from-amber-700 to-amber-800',
    text: 'text-white',
    shadow: 'shadow-[0_2px_8px_rgba(180,83,9,0.4)]',
    icon: Medal,
  },
}

export function RankBadge({ position, size = 'md', className }) {
  const style = rankStyles[position]

  if (!style) {
    // Posições comuns (4+)
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full font-body font-semibold',
          'bg-nude-medium text-dark/60',
          size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm',
          className
        )}
      >
        {position}
      </div>
    )
  }

  const Icon = style.icon

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        style.bg,
        style.text,
        style.shadow,
        size === 'sm' ? 'w-6 h-6' : 'w-9 h-9',
        className
      )}
    >
      <Icon size={size === 'sm' ? 12 : 16} strokeWidth={2.5} />
    </div>
  )
}

export default function Badge({
  children,
  variant = 'default',
  className,
  ...props
}) {
  const variants = {
    default: 'bg-nude-light text-dark/70 border border-nude-medium',
    gold: 'bg-gold/10 text-gold border border-gold/30',
    success: 'bg-sage/10 text-sage border border-sage/30',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-600 border border-red-200',
    pending: 'bg-nude-light text-dark/60 border border-nude-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-body font-medium',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
