
import { Loader2 } from 'lucide-react'

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

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-primary/20 border-t-primary`}
      />
    </div>
  )
}

export function LoadingInline({ text = 'Carregando...' }) {
  return (
    <div className="flex items-center gap-2.5 py-4 text-sm text-muted">
      <LoadingSpinner size="sm" />
      <span>{text}</span>
    </div>
  )
}

export function LoadingDots({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
    </span>
  )
}