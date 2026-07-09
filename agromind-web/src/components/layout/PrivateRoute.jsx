import { Navigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { LoadingScreen } from '../ui/Primitives'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen label="Verificando sessão..." />

  return user ? children : <Navigate to="/login" replace />
}
