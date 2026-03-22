import { cn } from '../../lib/utils'
import { Crown, Medal } from 'lucide-react'

/* ─── Paleta oficial Mentoria Sublime ─────────────────────────────────── */
const RANK_STYLES = {
  1: {
    bg: 'linear-gradient(135deg, #8e7028, #ab9051, #f2ea9c, #ab9051, #8e7028)',
    text: '#3D281C',
    shadow: '0 2px 8px rgba(142,112,40,0.45)',
    icon: Crown,
  },
  2: {
    bg: 'linear-gradient(135deg, #9a9690, #d4d0ca, #f0ede8, #d4d0ca, #9a9690)',
    text: '#ffffff',
    shadow: '0 2px 8px rgba(154,150,144,0.35)',
    icon: Medal,
  },
  3: {
    bg: 'linear-gradient(135deg, #604E44, #9a7060, #C7AA89, #9a7060, #604E44)',
    text: '#F6F2E7',
    shadow: '0 2px 8px rgba(96,78,68,0.35)',
    icon: Medal,
  },
}

export function RankBadge({ position, size = 'md', className }) {
  const style = RANK_STYLES[position]

  if (!style) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full font-body font-semibold',
          size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm',
          className
        )}
        style={{
          background: 'rgba(216,209,193,0.5)',
          color: 'rgba(41,41,41,0.6)',
        }}
      >
        {position}
      </div>
    )
  }

  const Icon = style.icon
  const dim = size === 'sm' ? 26 : 36

  return (
    <div
      className={cn('inline-flex items-center justify-center rounded-full flex-shrink-0', className)}
      style={{
        width: dim,
        height: dim,
        background: style.bg,
        color: style.text,
        boxShadow: style.shadow,
      }}
    >
      <Icon size={size === 'sm' ? 12 : 16} strokeWidth={2.5} style={{ color: style.text }} />
    </div>
  )
}

export default function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-nude-light text-dark/70 border border-nude-medium',
    gold:    'bg-gold/10 text-gold-dark border border-gold/30',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-[rgba(199,170,137,0.12)] text-[#8e7028] border border-[rgba(199,170,137,0.35)]',
    danger:  'bg-red-50 text-red-600 border border-red-200',
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
