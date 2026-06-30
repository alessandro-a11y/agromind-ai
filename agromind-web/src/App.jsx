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

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter" style={{ minHeight:'100vh' }}>
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
