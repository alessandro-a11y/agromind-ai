import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Primitives'

// Uso: envolva rotas ou seções sensíveis, ex. em AppLayout.jsx:
// <ErrorBoundary key={pathname}><Outlet /></ErrorBoundary>
export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturou um erro:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface p-10 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle size={22} />
        </span>
        <h2 className="text-base font-bold text-ink">Algo deu errado</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          Essa parte da tela encontrou um erro inesperado. Tente recarregar; se persistir, os detalhes já foram
          registrados no console.
        </p>
        <Button variant="secondary" size="sm" className="mt-5" onClick={this.handleReset}>
          <RefreshCw size={14} /> Tentar novamente
        </Button>
      </div>
    )
  }
}