import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Limiares por tipo:
 * - checklist: branca <25%, bege 25-60%, dourada >60%
 * - seguidores: branca <100 ganhos, bege 100-999, dourada >=1000
 * - faturamento: branca <20% crescimento, bege 20-49.99%, dourada >=50%
 */
function getStarLevel(type, value) {
  switch (type) {
    case 'checklist': {
      const pct = typeof value === 'number' ? value : 0
      if (pct >= 60) return 'gold'
      if (pct >= 25) return 'nude'
      return 'empty'
    }
    case 'seguidores': {
      const gained = typeof value === 'number' ? value : 0
      if (gained >= 1000) return 'gold'
      if (gained >= 100) return 'nude'
      return 'empty'
    }
    case 'faturamento': {
      const pct = typeof value === 'number' ? value : 0
      if (pct >= 50) return 'gold'
      if (pct >= 20) return 'nude'
      return 'empty'
    }
    default:
      return 'empty'
  }
}

const starStyles = {
  gold: {
    fill: '#C9A84C',
    stroke: '#C9A84C',
    shadow: 'drop-shadow(0 0 4px rgba(201,168,76,0.6))',
    label: 'Estrela dourada',
  },
  nude: {
    fill: '#E8D5C4',
    stroke: '#C9A84C',
    shadow: 'none',
    label: 'Estrela bege',
  },
  empty: {
    fill: 'none',
    stroke: '#D4D4D4',
    shadow: 'none',
    label: 'Estrela vazia',
  },
}

const typeLabels = {
  checklist: 'Checklist',
  seguidores: 'Seguidores',
  faturamento: 'Faturamento',
}

export default function StarRating({
  type,
  value,
  size = 16,
  showLabel = false,
  className,
}) {
  const level = getStarLevel(type, value)
  const style = starStyles[level]

  return (
    <div
      className={cn('inline-flex flex-col items-center gap-0.5', className)}
      title={`${typeLabels[type] || type}: ${style.label}`}
    >
      <Star
        size={size}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={1.5}
        style={{ filter: style.shadow }}
      />
      {showLabel && (
        <span className="text-[10px] font-body text-dark/50">
          {typeLabels[type] || type}
        </span>
      )}
    </div>
  )
}

/**
 * Grupo de 3 estrelas para ranking (checklist, seguidores, faturamento)
 */
export function StarGroup({ checklistPct, followersGained, revenueGrowthPct, size = 16, showLabels = false }) {
  return (
    <div className="flex items-center gap-1.5">
      <StarRating type="checklist" value={checklistPct} size={size} showLabel={showLabels} />
      <StarRating type="seguidores" value={followersGained} size={size} showLabel={showLabels} />
      <StarRating type="faturamento" value={revenueGrowthPct} size={size} showLabel={showLabels} />
    </div>
  )
}
