import { AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react'

export function Button({ variant = 'primary', size = 'md', className = '', loading, children, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-br from-primary to-primary-strong text-slate-950 hover:from-primary-strong hover:to-primary shadow-[0_12px_32px_rgba(79,226,136,0.28)]',
    secondary: 'bg-surface text-ink border border-border hover:bg-surface-muted hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]',
    ghost: 'bg-transparent text-muted hover:bg-surface-muted hover:text-ink',
    danger: 'bg-danger text-white hover:from-red-600 hover:to-red-700 shadow-[0_12px_32px_rgba(255,107,107,0.28)]',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    icon: 'h-9 w-9 p-0',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface shadow-[0_12px_36px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-shadow duration-300 ${className}`}>
      {children}
    </section>
  )
}

export function CardHeader({ title, eyebrow, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-3 border-b border-border/50 px-6 py-5 ${className}`}>
      <div>
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">{eyebrow}</p>}
        <h2 className="mt-1.5 text-base font-bold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-surface-muted text-muted',
    success: 'bg-primary-soft text-primary',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
  }
  return <span className={`inline-flex rounded-full border border-transparent px-2.5 py-1 text-xs font-semibold shadow-sm ${tones[tone]}`}>{children}</span>
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-danger">{error}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-primary focus:ring-4 focus:ring-primary/15 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`h-10 rounded-lg border border-border bg-surface-muted px-3.5 text-sm font-medium text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <Input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="pl-9" />
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-md ${className}`} />
}

export function EmptyState({ icon: Icon = AlertCircle, title, text, action }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted/60 p-8 text-center">
      <Icon size={28} className="mb-3 text-muted" />
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Toast({ message, tone = 'success', onClose }) {
  if (!message) return null
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle
  const color = tone === 'success' ? 'text-primary' : 'text-danger'
  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink shadow-2xl">
      <Icon size={18} className={color} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-muted hover:text-ink">Fechar</button>
    </div>
  )
}

export function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-muted hover:text-ink">Esc</button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
