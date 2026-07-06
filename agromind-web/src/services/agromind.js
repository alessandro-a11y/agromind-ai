import api from './api'

export const agromindService = {
  dashboard: async () => {
    const { data } = await api.get('/dashboard')
    return data
  },

  farms: async () => {
    const { data } = await api.get('/farms')
    return data ?? []
  },

  createFarm: async payload => {
    const { data } = await api.post('/farms', payload)
    return data
  },

  updateFarm: async (id, payload) => {
    await api.put(`/farms/${id}`, payload)
  },

  deleteFarm: async id => {
    await api.delete(`/farms/${id}`)
  },

  fields: async farmId => {
    const { data } = await api.get(`/farms/${farmId}/fields`)
    return data ?? []
  },

  createField: async (farmId, payload) => {
    const { data } = await api.post(`/farms/${farmId}/fields`, payload)
    return data
  },

  weather: async (farmId, fieldId = 'current') => {
    const { data } = await api.get(`/farms/${farmId}/fields/${fieldId}/weather`)
    return data
  },

  alerts: async ({ status, farmId, tipo, from, to, page = 1, size = 10 } = {}) => {
    const params = { page, size }
    if (status !== undefined && status !== '') params.status = status
    if (farmId !== undefined && farmId !== '') params.farmId = farmId
    if (tipo !== undefined && tipo !== '') params.tipo = tipo
    if (from) params.from = from
    if (to) params.to = to
    const { data } = await api.get('/alerts', { params })
    return data
  },

  resolveAlert: async id => {
    await api.patch(`/alerts/${id}/resolve`)
  },

  ignoreAlert: async id => {
    await api.patch(`/alerts/${id}/ignore`)
  },

  createDiagnosis: async fieldId => {
    const { data } = await api.post(`/fields/${fieldId}/diagnosis`)
    return data
  },

  diagnosisHistory: async fieldId => {
    const { data } = await api.get(`/fields/${fieldId}/diagnosis`)
    return data ?? []
  },

  diagnosisReportUrl: (fieldId, diagnosisId) =>
    `/api/fields/${fieldId}/diagnosis/${diagnosisId}/report`,

  diagnosisHistoryReportUrl: fieldId =>
    `/api/fields/${fieldId}/diagnosis/report`,
}
