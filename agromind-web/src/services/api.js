import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token em todo request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
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

    if (err.response?.status === 401 && !original._retry) {
      const accessToken  = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (!accessToken || !refreshToken) {
        clearSession()
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
