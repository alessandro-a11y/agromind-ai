import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import PrivateRoute from './components/layout/PrivateRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Fazendas from './pages/Fazendas'
import Clima from './pages/Clima'
import Alertas from './pages/Alertas'
import Diagnostico from './pages/Diagnostico'
import { useEffect, useRef } from 'react'

function AnimatedRoutes() {
  const location = useLocation()
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.style.opacity = '0'
    ref.current.style.transform = 'translateY(10px)'
    const t = requestAnimationFrame(() => {
      if (!ref.current) return
      ref.current.style.transition = 'opacity .28s ease, transform .28s ease'
      ref.current.style.opacity = '1'
      ref.current.style.transform = 'translateY(0)'
    })
    return () => cancelAnimationFrame(t)
  }, [location.pathname])

  return (
    <div ref={ref} style={{ minHeight:'100vh' }}>
      <Routes location={location}>
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/fazendas"    element={<Fazendas />} />
          <Route path="/clima"       element={<Clima />} />
          <Route path="/alertas"     element={<Alertas />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
