import { cn } from '../../lib/utils'
import LoadingSpinner from './LoadingSpinner'

const variants = {
  primary:
    'bg-dark text-cream hover:bg-[#5c4f46] focus:ring-dark/30 shadow-sm',
  ghost:
    'bg-transparent text-dark border border-bronze hover:bg-bronze/10 focus:ring-bronze/30',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400/40 shadow-sm',
  secondary:
    'bg-nude-light text-dark border border-nude-medium hover:bg-nude-medium focus:ring-nude-medium/40',
  nude:
    'bg-nude-light text-dark hover:bg-nude-medium focus:ring-nude-medium/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-body font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" color={variant === 'ghost' ? 'gold' : 'white'} />
          <span>Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
