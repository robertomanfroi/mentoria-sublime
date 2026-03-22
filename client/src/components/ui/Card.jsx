import { cn } from '../../lib/utils'

const variants = {
  default:  'bg-white border border-[rgba(45,45,45,0.08)] shadow-soft',
  gold:     'bg-white border border-bronze/50 shadow-[0_4px_24px_rgba(189,167,136,0.18)]',
  nude:     'bg-nude-light border border-nude-medium/30',
  elevated: 'bg-white shadow-card border border-[rgba(45,45,45,0.06)]',
}

export default function Card({
  children,
  variant = 'default',
  className,
  hover = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5',
        'transition-all duration-200',
        variants[variant] || variants.default,
        hover && 'hover:shadow-card hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

Card.Title = function CardTitle({ children, className }) {
  return (
    <h3 className={cn('font-display text-lg font-semibold text-dark', className)}>
      {children}
    </h3>
  )
}

Card.Body = function CardBody({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}
