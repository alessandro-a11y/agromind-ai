import { forwardRef } from 'react'

export const Card = forwardRef(function Card(
  { children, className = '', hover = false, padding = true, glow = false, ...props },
  ref
) {
  return (
    <section
      ref={ref}
      className={`relative rounded-xl border border-border/60 bg-surface shadow-md transition-all duration-300 ${
        hover
          ? 'dashboard-card hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-strong'
          : ''
      } ${glow ? 'shadow-glow' : ''} ${
        padding ? '' : 'overflow-hidden'
      } ${className}`}
      {...props}
    >
      {children}
    </section>
  )
})

export function CardHeader({ title, eyebrow, action, className = '' }) {
  return (
    <div
      className={`flex items-start justify-between gap-3 border-b border-border/40 px-[var(--spacing-card)] py-4 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </p>
        )}
        <h3 className="truncate text-sm font-bold text-ink">{title}</h3>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`p-[var(--spacing-card)] ${className}`}>{children}</div>
  )
}

export function CardFooter({ children, className = '', divided = true }) {
  return (
    <div
      className={`${divided ? 'border-t border-border/40' : ''} px-[var(--spacing-card)] py-3.5 ${className}`}
    >
      {children}
    </div>
  )
}

export function CardGroup({ children, className = '' }) {
  return (
    <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {children}
    </div>
  )
}

export function CardMetric({ label, value, trend, icon: Icon, color = 'text-primary' }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.replace('text-', 'bg-').replace('primary', 'primary-soft').replace('danger', 'danger-soft').replace('warning', 'warning-soft').replace('info', 'info-soft')} ${color}`}
        >
          <Icon size={18} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-black text-ink">{value}</p>
          {trend && (
            <span
              className={`text-[11px] font-semibold ${
                trend > 0 ? 'text-primary' : trend < 0 ? 'text-danger' : 'text-muted'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}