import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import ProgressBar from '../ui/ProgressBar'
import ChecklistItem from './ChecklistItem'

export default function StageAccordion({
  stage,
  items,
  forceOpen,
  onToggle,
}) {
  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const [open, setOpen] = useState(false)

  // Controle externo (expandir/colapsar todos)
  useEffect(() => {
    if (forceOpen !== undefined) {
      setOpen(forceOpen)
    }
  }, [forceOpen])

  function handleItemToggle(itemId, newState) {
    onToggle?.(itemId, newState)
  }

  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden transition-all duration-200',
        open
          ? 'border-gold/30 shadow-[0_2px_12px_rgba(201,168,76,0.1)]'
          : 'border-nude-medium/40 shadow-soft'
      )}
    >
      {/* Header do acordeão */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-4 px-5 py-4 text-left bg-white',
          'transition-colors duration-200',
          open ? 'bg-gold/5' : 'hover:bg-nude-light/50'
        )}
      >
        {/* Stage number */}
        <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-body font-bold text-gold">
            {stage.order || stage.number}
          </span>
        </div>

        {/* Nome + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-display font-semibold text-dark text-sm leading-tight truncate">
              {stage.name}
            </h3>
            <span className="text-xs font-body text-dark/50 flex-shrink-0">
              {completed}/{total}
            </span>
          </div>
          <ProgressBar value={pct} showPercent={false} size="sm" animated={false} />
        </div>

        {/* Chevron */}
        <ChevronDown
          size={18}
          className={cn(
            'text-dark/40 flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Items */}
      {open && (
        <div className="bg-white border-t border-nude-medium/20 px-3 py-2 space-y-0.5">
          {items.length === 0 ? (
            <p className="text-sm font-body text-dark/40 px-3 py-4 text-center">
              Nenhum item nesta etapa.
            </p>
          ) : (
            items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={handleItemToggle}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
