import { cn } from '../../lib/utils'

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
}

const colors = {
  gold: 'border-gold/20 border-t-gold',
  white: 'border-white/20 border-t-white',
  dark: 'border-dark/20 border-t-dark',
}

export default function LoadingSpinner({
  size = 'md',
  color = 'gold',
  centered = false,
  className,
}) {
  const spinner = (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizes[size] || sizes.md,
        colors[color] || colors.gold,
        className
      )}
    />
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    )
  }

  return spinner
}
