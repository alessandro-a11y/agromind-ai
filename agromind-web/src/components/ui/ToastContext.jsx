import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = { success: CheckCircle2, danger: AlertCircle, warning: AlertCircle, info: Info }
const colors = { success: 'text-primary', danger: 'text-danger', warning: 'text-warning', info: 'text-info' }

// Envolva a aplicação uma única vez com <ToastProvider> (ex.: main.jsx ou App.jsx)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback(id => {
    setToasts(current => current.filter(t => t.id !== id))
  }, [])

  // toast('Fazenda salva com sucesso')
  // toast('Erro ao salvar', { tone: 'danger' })
  // toast('Atenção: clima instável', { tone: 'warning', duration: 6000 })
  const toast = useCallback(
    (message, options = {}) => {
      const id = ++idRef.current
      const tone = options.tone ?? 'success'
      const duration = options.duration ?? 4000
      setToasts(current => [...current, { id, message, tone }])
      if (duration > 0) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[1000] flex w-full max-w-sm flex-col gap-2">
        {toasts.map(t => {
          const Icon = icons[t.tone] ?? CheckCircle2
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border/60 bg-surface/95 px-4 py-3 text-sm text-ink shadow-2xl backdrop-blur-md animate-slide-up"
            >
              <Icon size={18} className={`shrink-0 ${colors[t.tone] ?? colors.success}`} />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-surface-muted hover:text-ink"
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa ser usado dentro de <ToastProvider>')
  return ctx
}