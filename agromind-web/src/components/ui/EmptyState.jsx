import { AlertCircle, Plus } from 'lucide-react'

export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  text,
  action,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-surface-muted/30 text-center animate-fade-in ${
        compact ? 'min-h-40 p-8' : 'min-h-56 p-10'
      } ${className}`}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-muted/50">
        <Icon size={26} />
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {text && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted/80">
          {text}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function EmptyStateSimple({ icon: Icon = Plus, text, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border/40 bg-surface-muted/20 px-6 py-8 text-center ${className}`}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-muted/40">
        <Icon size={20} />
      </span>
      <p className="text-sm text-muted">{text}</p>
    </div>
  )
}