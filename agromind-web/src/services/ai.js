import api from './api'

/**
 * Serviço do Assistente IA
 * 
 * Envia mensagem + histórico no formato esperado pelo backend.
 * O backend (AiController) espera:
 *   { message, history: [{ role, content }] }
 */
export const aiService = {
  /**
   * Envia uma mensagem para o assistente
   * @param {string} message - Mensagem atual do usuário
   * @param {Array} history - Histórico formatado [{ role, content }]
   * @param {string} [farmContext] - Contexto opcional da fazenda (JSON)
   */
  chat: async ({ message, history, farmContext }) => {
    const payload = {
      message,
      history,
    }

    if (farmContext) {
      payload.farm_context = farmContext
    }
    const { data } = await api.post('/ai/chat', payload)
    return data
  },
}