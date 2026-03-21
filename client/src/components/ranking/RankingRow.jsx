import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import { RankBadge } from '../ui/Badge'
import { StarGroup } from '../ui/StarRating'

export default function RankingRow({ entry, position, isCurrentUser = false }) {
  const growthPct = entry.followers_growth_pct ?? 0
  const gained = entry.followers_gained ?? 0

  const GrowthIcon = growthPct > 0 ? TrendingUp : growthPct < 0 ? TrendingDown : Minus
  const growthColor = growthPct > 0 ? 'text-sage' : growthPct < 0 ? 'text-red-400' : 'text-dark/40'

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
        isCurrentUser
          ? 'bg-gold/8 border border-gold/30'
          : 'hover:bg-nude-light/60'
      )}
    >
      {/* Posição */}
      <div className="w-8 flex-shrink-0">
        <RankBadge position={position} size="sm" />
      </div>

      {/* Avatar */}
      <Avatar
        src={entry.avatar_url}
        name={entry.name}
        size="sm"
        gold={position <= 3}
      />

      {/* Nome e @ */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn(
            'text-sm font-body font-medium text-dark truncate',
            isCurrentUser && 'text-gold'
          )}>
            {entry.name}
          </p>
          {isCurrentUser && (
            <span className="text-[10px] font-body text-gold/70 bg-gold/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
              você
            </span>
          )}
        </div>
        {entry.instagram && (
          <p className="text-xs font-body text-dark/40 truncate">
            @{entry.instagram}
          </p>
        )}
      </div>

      {/* Crescimento seguidores */}
      <div className="hidden sm:flex items-center gap-1 min-w-[80px] justify-end">
        <GrowthIcon size={13} className={growthColor} />
        <span className={cn('text-xs font-body font-medium', growthColor)}>
          {gained > 0 ? '+' : ''}{gained.toLocaleString('pt-BR')}
        </span>
      </div>

      {/* Estrelas */}
      <div className="hidden md:flex">
        <StarGroup
          checklistPct={entry.checklist_pct}
          followersGained={gained}
          revenueGrowthPct={entry.revenue_growth_pct}
          size={15}
        />
      </div>

      {/* Score */}
      <div className="flex-shrink-0 min-w-[52px] text-right">
        <span className="text-sm font-body font-semibold text-gold">
          {entry.score?.toFixed(1) || '0.0'}
        </span>
      </div>
    </div>
  )
}
