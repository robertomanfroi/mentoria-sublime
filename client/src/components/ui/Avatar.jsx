import { cn } from '../../lib/utils'
import { getInitials } from '../../lib/utils'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
}

export default function Avatar({
  src,
  name,
  size = 'md',
  gold = false,
  pulse = false,
  className,
}) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-beige font-display font-semibold text-gold select-none flex-shrink-0',
        sizes[size] || sizes.md,
        gold && 'ring-2 ring-gold ring-offset-1',
        pulse && 'animate-pulse-gold',
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
      ) : null}

      {/* Fallback com iniciais */}
      <span
        className={cn(
          'flex items-center justify-center w-full h-full',
          src && 'hidden'
        )}
      >
        {getInitials(name)}
      </span>
    </div>
  )
}
