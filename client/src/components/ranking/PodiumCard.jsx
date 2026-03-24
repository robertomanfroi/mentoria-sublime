import { Crown, Medal } from 'lucide-react'
import { cn } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import { StarGroup } from '../ui/StarRating'

/* ─── Paleta oficial Mentoria Sublime ─────────────────────────────────── */
const positionConfig = {
  1: {
    label: '1º lugar',
    icon: Crown,
    cardClass: 'order-2',
    wrapClass: 'z-10',
    avatarSize: '2xl',
    cardBg: 'linear-gradient(160deg, rgba(199,170,137,0.08) 0%, #ffffff 60%)',
    cardBorder: 'rgba(199,170,137,0.5)',
    cardShadow: '0 8px 40px rgba(199,170,137,0.22), 0 2px 8px rgba(0,0,0,0.06)',
    badgeBg: 'linear-gradient(135deg, #8e7028, #ab9051, #f2ea9c, #ab9051, #8e7028)',
    badgeColor: '#3D281C',
    badgeShadow: '0 2px 8px rgba(142,112,40,0.45)',
    scaleClass: 'scale-105',
    labelColor: 'rgba(142,112,40,0.9)',
  },
  2: {
    label: '2º lugar',
    icon: Medal,
    cardClass: 'order-1 mt-6',
    wrapClass: '',
    avatarSize: 'xl',
    cardBg: '#ffffff',
    cardBorder: '#D8D1C1',
    cardShadow: '0 4px 20px rgba(41,41,41,0.07)',
    badgeBg: 'linear-gradient(135deg, #9a9690, #d4d0ca, #f0ede8, #d4d0ca, #9a9690)',
    badgeColor: '#ffffff',
    badgeShadow: '0 2px 8px rgba(154,150,144,0.35)',
    scaleClass: '',
    labelColor: 'rgba(154,150,144,0.9)',
  },
  3: {
    label: '3º lugar',
    icon: Medal,
    cardClass: 'order-3 mt-6',
    wrapClass: '',
    avatarSize: 'xl',
    cardBg: '#ffffff',
    cardBorder: 'rgba(199,170,137,0.3)',
    cardShadow: '0 4px 20px rgba(41,41,41,0.07)',
    badgeBg: 'linear-gradient(135deg, #604E44, #9a7060, #C7AA89, #9a7060, #604E44)',
    badgeColor: '#F6F2E7',
    badgeShadow: '0 2px 8px rgba(96,78,68,0.35)',
    scaleClass: '',
    labelColor: 'rgba(96,78,68,0.8)',
  },
}

export default function PodiumCard({ entry, position }) {
  const config = positionConfig[position]
  if (!config || !entry) return null

  const BadgeIcon = config.icon
  const isPulse = position === 1

  return (
    <div className={cn('flex flex-col items-center', config.wrapClass)}>
      <div
        className={cn(
          'relative flex flex-col items-center p-5 rounded-2xl w-44',
          'transition-all duration-300',
          config.cardClass,
          config.scaleClass
        )}
        style={{
          background: config.cardBg,
          border: `1px solid ${config.cardBorder}`,
          boxShadow: config.cardShadow,
        }}
      >
        {/* Badge de posição */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            background: config.badgeBg,
            boxShadow: config.badgeShadow,
          }}
        >
          <BadgeIcon size={16} strokeWidth={2.5} style={{ color: config.badgeColor }} />
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
        <h3
          className="mt-3 font-display font-semibold text-center text-sm leading-tight line-clamp-2"
          style={{ color: '#292929' }}
        >
          {entry.name}
        </h3>

        {/* Instagram */}
        {entry.instagram_handle && (
          <p className="text-xs font-body mt-0.5" style={{ color: 'rgba(96,78,68,0.6)' }}>
            @{entry.instagram_handle}
          </p>
        )}

        {/* Score */}
        <div
          className="mt-2 px-3 py-1 rounded-full"
          style={{ background: 'rgba(199,170,137,0.12)' }}
        >
          <span className="text-sm font-body font-semibold" style={{ color: '#8e7028' }}>
            {entry.total_score?.toFixed(1) || '0.0'} pts
          </span>
        </div>

        {/* Estrelas */}
        <div className="mt-3">
          <StarGroup
            checklistPct={entry.checklist_score}
            followersGained={entry.followers_gained}
            revenueGrowthPct={entry.revenue_growth_pct}
            size={18}
            showLabels={false}
          />
        </div>

        {/* Label */}
        <p
          className="mt-2 text-[10px] font-body font-semibold uppercase tracking-widest"
          style={{ color: config.labelColor }}
        >
          {config.label}
        </p>
      </div>
    </div>
  )
}
