import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import PrivateRoute from './components/layout/PrivateRoute'
import AppLayout from './components/layout/AppLayout'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Fazendas = lazy(() => import('./pages/Fazendas'))
const Clima = lazy(() => import('./pages/Clima'))
const Alertas = lazy(() => import('./pages/Alertas'))
const Diagnostico = lazy(() => import('./pages/Diagnostico'))
const Chat = lazy(() => import('./pages/Chat'))

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
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
      </AuthProvider>
    </BrowserRouter>
  )
}
