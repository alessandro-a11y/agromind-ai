import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import PrivateRoute from './components/layout/PrivateRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Fazendas from './pages/Fazendas'
import Clima from './pages/Clima'
import Alertas from './pages/Alertas'
import Diagnostico from './pages/Diagnostico'

const Placeholder = ({ title }) => (
  <div style={{ padding:40, color:'var(--color-brand-text)' }}>
    <h1 style={{ fontSize:24, fontWeight:600 }}>{title}</h1>
    <p style={{ color:'var(--color-brand-muted)', marginTop:8 }}>Em construção...</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/fazendas"    element={<Fazendas />} />
            <Route path="/clima"       element={<Clima />} />
            <Route path="/alertas"     element={<Alertas />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
