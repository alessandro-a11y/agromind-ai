/**
 * Serviço de Geocodificação — Open-Meteo Geocoding API
 * 
 * API gratuita que não requer chave.
 * Converte endereço (cidade, estado) em coordenadas (lat, lng).
 * https://open-meteo.com/en/docs/geocoding-api
 */

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search'

export const geocodingService = {
  /**
   * Busca coordenadas para um endereço
   * @param {string} city - Nome da cidade
   * @param {string} state - UF do estado (opcional)
   * @returns {Promise<{latitude: number, longitude: number, nome: string} | null>}
   */
  search: async (city, state = '') => {
    const query = state ? `${city}, ${state}, Brasil` : `${city}, Brasil`
    
    const params = new URLSearchParams({
      name: query,
      count: 5,
      language: 'pt',
      format: 'json',
    })

    const response = await fetch(`${GEO_BASE}?${params}`)
    if (!response.ok) throw new Error(`Geocoding error: ${response.status}`)
    
    const data = await response.json()
    
    if (!data.results?.length) {
      // Tenta sem o estado
      if (state) return geocodingService.search(city, '')
      return null
    }

    // Pega o primeiro resultado brasileiro
    const result = data.results.find(r => r.country_code === 'BR') ?? data.results[0]
    
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      nome: result.name,
      estado: result.admin1 ?? state,
      pais: result.country ?? 'Brasil',
    }
  },

  /**
   * Busca coordenadas pelo CEP (via Open-Meteo, que suporta busca por CEP)
   * @param {string} cep - CEP no formato 00000-000 ou 00000000
   */
  searchByCep: async (cep) => {
    const cleaned = cep.replace(/\D/g, '')
    if (cleaned.length !== 8) throw new Error('CEP deve ter 8 dígitos')

    const response = await fetch(`${GEO_BASE}?name=${cleaned}&count=5&language=pt&format=json`)
    if (!response.ok) throw new Error(`Geocoding error: ${response.status}`)
    
    const data = await response.json()
    if (!data.results?.length) return null

    const result = data.results[0]
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      nome: result.name,
      estado: result.admin1 ?? '',
    }
  },

  /**
   * Obtém nome da cidade a partir de coordenadas (reverse geocoding)
   */
  reverse: async (latitude, longitude) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=pt&format=json`
    )
    if (!response.ok) throw new Error(`Reverse geocoding error: ${response.status}`)
    
    const data = await response.json()
    if (!data.results?.length) return null

    const result = data.results[0]
    return {
      cidade: result.name,
      estado: result.admin1 ?? '',
      pais: result.country ?? 'Brasil',
    }
  },
}