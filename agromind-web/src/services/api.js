import axios from 'axios'

// Usa variável de ambiente VITE_API_URL; fallback para desenvolvimento local
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de requisição – adiciona token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve())
  failedQueue = []
}

const clearSession = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

const isAuthEndpoint = url =>
  url?.includes('/auth/login') ||
  url?.includes('/auth/register') ||
  url?.includes('/auth/refresh')

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (!original || isAuthEndpoint(original.url)) {
      return Promise.reject(err)
    }

    // Se for erro 401 e não for endpoint de autenticação, tenta refresh
    if (err.response?.status === 401 && !original._retry) {
      const accessToken  = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (!accessToken || !refreshToken) {
        clearSession()
        // Redireciona para login apenas se não estiver já na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original)).catch(e => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await api.post('/auth/refresh', { accessToken, refreshToken })
        localStorage.setItem('accessToken',  data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        processQueue(null)
        return api(original)
      } catch (e) {
        processQueue(e)
        clearSession()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
