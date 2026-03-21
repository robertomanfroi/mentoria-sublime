import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export default function ProgressBar({
  value = 0,
  label,
  showPercent = true,
  size = 'md',
  className,
  animated = true,
}) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const [displayed, setDisplayed] = useState(0)
  const fillRef = useRef(null)

  useEffect(() => {
    if (!animated) {
      setDisplayed(clampedValue)
      return
    }

    // Animação suave do número
    const start = 0
    const end = clampedValue
    const duration = 800
    const startTime = performance.now()

    function update(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOut
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [clampedValue, animated])

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-body text-dark/70">{label}</span>
          )}
          {showPercent && (
            <span className="text-sm font-body font-medium text-gold">
              {displayed}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'w-full rounded-full bg-nude-medium/60 overflow-hidden',
          heights[size] || heights.md
        )}
      >
        {/* Fill */}
        <div
          ref={fillRef}
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            'bg-gradient-to-r from-gold to-nude-medium',
            animated && 'transition-[width] duration-[800ms] ease-out'
          )}
          style={{ width: `${clampedValue}%` }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>
    </div>
  )
}
