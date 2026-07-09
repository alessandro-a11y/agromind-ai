import { AlertCircle, CheckCircle2, Info, Loader2, Search, X } from 'lucide-react'

export function Button({ variant = 'primary', size = 'md', className = '', loading, children, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-br from-primary to-primary-strong text-slate-950 hover:from-primary-strong hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
    secondary: 'bg-surface text-ink border border-border hover:bg-surface-muted hover:border-white/10',
    ghost: 'bg-transparent text-muted hover:bg-surface-muted hover:text-ink',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-lg shadow-danger/20',
    outline: 'bg-transparent text-primary border border-primary/30 hover:bg-primary-soft',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-9 w-9 p-0',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <section
      className={`rounded-xl border border-border/60 bg-surface shadow-md transition-all duration-300 ${
        hover ? 'dashboard-card hover:border-primary/20' : 'hover:shadow-lg'
      } ${padding ? '' : 'overflow-hidden'} ${className}`}
    >
      {children}
    </section>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-[var(--spacing-card)] ${className}`}>{children}</div>
}

export function CardHeader({ title, eyebrow, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-3 border-b border-border/40 px-5 py-4 ${className}`}>
      <div>
        {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{eyebrow}</p>}
        <h2 className="text-sm font-bold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-surface-muted text-muted border-white/5',
    success: 'bg-primary-soft text-primary border-primary/20',
    warning: 'bg-warning-soft text-warning border-warning/20',
    danger: 'bg-danger-soft text-danger border-danger/20',
    info: 'bg-info-soft text-info border-info/20',
  }
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-danger">{error}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`h-10 rounded-lg border border-border bg-surface-muted px-3.5 text-sm font-medium text-ink outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <Input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="pl-9" />
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />
}

export function SkeletonGroup({ count = 3, className = 'h-40' }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  )
}

export function LoadingOverlay({ label = 'Carregando...' }) {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center gap-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <Loader2 size={20} className="text-primary animate-pulse" />
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  )
}

export function LoadingScreen({ label = 'Carregando AgroMind...' }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-canvas">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        <span className="text-xl">🌾</span>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-ink">AgroMind</p>
        <p className="mt-1 text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon = AlertCircle, title, text, action }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-surface-muted/30 p-10 text-center animate-fade-in">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-muted/50">
        <Icon size={26} />
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted/80">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Toast({ message, tone = 'success', onClose }) {
  if (!message) return null
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle
  const color = tone === 'success' ? 'text-primary' : 'text-danger'
  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex max-w-sm items-center gap-3 rounded-xl border border-border/60 bg-surface/95 backdrop-blur-md px-4 py-3 text-sm text-ink shadow-2xl animate-slide-up">
      <Icon size={18} className={`shrink-0 ${color}`} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 rounded-md p-1 text-muted hover:bg-surface-muted hover:text-ink transition-colors">
        <X size={14} />
      </button>
    </div>
  )
}

export function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-border/60 bg-surface shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-ink transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border/40 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

