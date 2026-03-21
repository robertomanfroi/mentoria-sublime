import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  className,
}) {
  const overlayRef = useRef(null)

  // Fechar com ESC
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquear scroll do body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.()
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm animate-fade-in-up" />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white shadow-card',
          'animate-fade-in-up',
          sizes[size] || sizes.md,
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-nude-medium/30">
            <h2 className="font-display text-xl font-semibold text-dark">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-dark/40 hover:text-dark hover:bg-nude-light transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
