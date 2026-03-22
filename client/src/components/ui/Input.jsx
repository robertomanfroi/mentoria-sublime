import { useState } from 'react'
import { cn } from '../../lib/utils'

export default function Input({
  label,
  error,
  icon: Icon,
  iconRight: IconRight,
  className,
  id,
  type = 'text',
  ...props
}) {
  const [focused, setFocused] = useState(false)
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const hasValue = props.value !== undefined ? !!props.value : undefined

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Ícone esquerdo */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40 pointer-events-none z-10">
            <Icon size={18} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'peer w-full rounded-xl border bg-white px-4 pt-6 pb-2 text-sm font-body',
            'text-dark placeholder-transparent',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            Icon && 'pl-10',
            IconRight && 'pr-10',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-300/30'
              : 'border-beige focus:border-gold focus:ring-gold/25',
            className
          )}
          placeholder={label}
          {...props}
        />

        {/* Label flutuante */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 transition-all duration-200 pointer-events-none font-body',
              Icon && 'left-10',
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-dark/40',
              'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-gold',
              focused || hasValue
                ? 'top-2 translate-y-0 text-xs text-gold'
                : 'top-1/2 -translate-y-1/2 text-sm text-dark/40'
            )}
          >
            {label}
          </label>
        )}

        {/* Ícone direito */}
        {IconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 z-10">
            <IconRight size={18} />
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-body">{error}</p>
      )}
    </div>
  )
}
