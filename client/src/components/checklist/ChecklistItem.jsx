import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { checklistApi } from '../../lib/api'

export default function ChecklistItem({ item, onToggle }) {
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(item.completed)

  async function handleToggle() {
    if (loading) return
    setLoading(true)
    const newState = !checked
    setChecked(newState) // optimistic update

    try {
      await checklistApi.toggleItem(item.id)
      onToggle?.(item.id, newState)
    } catch {
      setChecked(!newState) // rollback
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left',
        'transition-all duration-200',
        'hover:bg-nude-light/70',
        loading && 'opacity-70 cursor-wait'
      )}
    >
      {/* Checkbox customizado */}
      <div
        className={cn(
          'relative flex-shrink-0 w-5 h-5 rounded-md border-2 mt-0.5',
          'flex items-center justify-center',
          'transition-all duration-200',
          checked
            ? 'bg-gold border-gold'
            : 'border-nude-medium bg-white hover:border-gold/60',
          loading && 'animate-pulse'
        )}
      >
        {checked && (
          <Check
            size={12}
            className="text-white"
            strokeWidth={3}
          />
        )}
      </div>

      {/* Texto */}
      <span
        className={cn(
          'text-sm font-body leading-relaxed transition-all duration-200',
          checked ? 'text-dark/40 line-through' : 'text-dark'
        )}
      >
        {item.description || item.title}
      </span>
    </button>
  )
}
