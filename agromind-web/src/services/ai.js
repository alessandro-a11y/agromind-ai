import api from './api'

export const aiService = {
  chat: async ({ message, history }) => {
    const { data } = await api.post('/ai/chat', { message, history })
    return data
  },
}
