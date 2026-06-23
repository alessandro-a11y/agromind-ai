import { Navigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen"
           style={{ background: 'var(--color-brand-bg)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin"
             style={{ borderColor: 'var(--color-brand-green)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
