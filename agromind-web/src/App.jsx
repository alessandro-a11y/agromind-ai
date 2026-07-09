import { lazy, Suspense, Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import { ToastProvider } from './components/ui/ToastContext'
import { TooltipProvider } from './components/ui/Tooltip'
import PrivateRoute from './components/layout/PrivateRoute'
import AppLayout from './components/layout/AppLayout'
import { LoadingScreen } from './components/ui/Primitives'
import { AlertTriangle } from 'lucide-react'

// Evita tela branca quando uma página lazy falha ao carregar
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#060b08] text-white">
          <AlertTriangle size={32} className="text-danger" />
          <p className="text-lg font-bold">Erro ao carregar página</p>
          <p className="text-sm text-white/60">Tente recarregar. Se persistir, contate o suporte.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-[#050a06]"
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Fazendas = lazy(() => import('./pages/Fazendas'))
const Clima = lazy(() => import('./pages/Clima'))
const Alertas = lazy(() => import('./pages/Alertas'))
const Diagnostico = lazy(() => import('./pages/Diagnostico'))
const Chat = lazy(() => import('./pages/Chat'))

function LoadingFallback() {
  return <LoadingScreen />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <TooltipProvider delayDuration={300}>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/fazendas" element={<Fazendas />} />
                <Route path="/clima" element={<Clima />} />
                <Route path="/alertas" element={<Alertas />} />
                <Route path="/diagnostico" element={<Diagnostico />} />
                <Route path="/chat" element={<Chat />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
              </Suspense>
            </ErrorBoundary>
          </TooltipProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}