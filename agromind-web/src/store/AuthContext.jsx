import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authService.me()
      // /api/auth/me retorna { id, email, name|nome, role }
      const name = data.name || data.nome || null
      setUser({ id: data.id || data.userId || null, name, email: data.email, role: data.role })
    } catch {
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    // Extrai o nome diretamente do response do login (AuthResponse contém nome)
    // e já seta o user imediatamente, sem depender exclusivamente do fetchMe
    const name = data.nome || data.name || null
    setUser({ id: null, name, email, role: data.role || null })
    // Tenta buscar /me para enriquecer os dados (id, role), mas não bloqueia
    fetchMe().catch(() => {})
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


