import { Crown, Medal } from 'lucide-react'
import { cn } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import { StarGroup } from '../ui/StarRating'

const positionConfig = {
  1: {
    label: '1º lugar',
    icon: Crown,
    cardClass: 'order-2 scale-105',
    wrapClass: 'z-10',
    avatarSize: '2xl',
    bgClass: 'bg-gradient-to-b from-gold/10 to-nude-light border-gold/50',
    badgeClass: 'bg-gradient-to-br from-gold to-amber-400 text-white',
    badgeIcon: Crown,
  },
  2: {
    label: '2º lugar',
    icon: Medal,
    cardClass: 'order-1 mt-6',
    wrapClass: '',
    avatarSize: 'xl',
    bgClass: 'bg-white border-slate-200',
    badgeClass: 'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
    badgeIcon: Medal,
  },
  3: {
    label: '3º lugar',
    icon: Medal,
    cardClass: 'order-3 mt-6',
    wrapClass: '',
    avatarSize: 'xl',
    bgClass: 'bg-white border-amber-700/20',
    badgeClass: 'bg-gradient-to-br from-amber-700 to-amber-800 text-white',
    badgeIcon: Medal,
  },
}

export default function PodiumCard({ entry, position }) {
  const config = positionConfig[position]
  if (!config || !entry) return null

  const BadgeIcon = config.badgeIcon
  const isPulse = position === 1

  return (
    <div className={cn('flex flex-col items-center', config.wrapClass)}>
      <div
        className={cn(
          'relative flex flex-col items-center p-5 rounded-2xl border shadow-soft w-44',
          'transition-all duration-300',
          config.bgClass,
          config.cardClass
        )}
      >
        {/* Badge de posição */}
        <div
          className={cn(
            'absolute -top-4 left-1/2 -translate-x-1/2',
            'flex items-center justify-center w-8 h-8 rounded-full shadow-md',
            config.badgeClass
          )}
        >
          <BadgeIcon size={16} strokeWidth={2.5} />
        </div>

        {/* Avatar */}
        <div className="mt-3">
          <Avatar
            src={entry.avatar_url}
            name={entry.name}
            size={config.avatarSize}
            gold={true}
            pulse={isPulse}
          />
        </div>

        {/* Nome */}
        <h3 className="mt-3 font-display font-semibold text-dark text-center text-sm leading-tight line-clamp-2">
          {entry.name}
        </h3>

        {/* Instagram */}
        {entry.instagram && (
          <p className="text-xs font-body text-dark/50 mt-0.5">
            @{entry.instagram}
          </p>
        )}

        {/* Score */}
        <div className="mt-2 px-3 py-1 rounded-full bg-gold/10">
          <span className="text-sm font-body font-semibold text-gold">
            {entry.score?.toFixed(1) || '0.0'} pts
          </span>
        </div>

        {/* Estrelas */}
        <div className="mt-3">
          <StarGroup
            checklistPct={entry.checklist_pct}
            followersGained={entry.followers_gained}
            revenueGrowthPct={entry.revenue_growth_pct}
            size={18}
            showLabels={false}
          />
        </div>

        {/* Label */}
        <p className="mt-2 text-[11px] font-body text-dark/40 font-medium uppercase tracking-wide">
          {config.label}
        </p>
      </div>
    </div>
  )
}
