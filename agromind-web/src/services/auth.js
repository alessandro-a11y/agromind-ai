import api from './api'

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, senha: password })
    localStorage.setItem('accessToken',  data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return Promise.resolve()
  },

  me: () => api.get('/auth/me'),

  refresh: () => {
    const accessToken  = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    return api.post('/auth/refresh', { accessToken, refreshToken })
  },
}
