/**
 * Serviço de Clima em Tempo Real — Open-Meteo
 * 
 * API gratuita que não requer chave de API.
 * https://open-meteo.com/
 * 
 * Endpoint: https://api.open-meteo.com/v1/forecast
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export const weatherService = {
  /**
   * Obtém clima atual e previsão para coordenadas
   */
  getCurrent: async (latitude, longitude) => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'uv_index',
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'weather_code',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
        'sunrise',
        'sunset',
        'uv_index_max',
      ].join(','),
      timezone: 'America/Sao_Paulo',
      forecast_days: 7,
    })

    const response = await fetch(`${BASE_URL}?${params}`)
    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`)
    return response.json()
  },

  /**
   * Obtém histórico climático (últimos 7 dias)
   */
  getHistorical: async (latitude, longitude) => {
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      start_date: startDate,
      end_date: endDate,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'weather_code',
        'wind_speed_10m_max',
      ].join(','),
      timezone: 'America/Sao_Paulo',
    })

    const response = await fetch(`${BASE_URL}?${params}`)
    if (!response.ok) throw new Error(`Open-Meteo historical error: ${response.status}`)
    return response.json()
  },

  /**
   * Mapeia weather_code da OMM para descrição em português
   */
  weatherDescription(code) {
    const map = {
      0: 'Céu limpo',
      1: 'Predominantemente limpo',
      2: 'Parcialmente nublado',
      3: 'Encoberto',
      45: 'Nevoeiro',
      48: 'Nevoeiro com geada',
      51: 'Garoa leve',
      53: 'Garoa moderada',
      55: 'Garoa intensa',
      56: 'Garoa congelante leve',
      57: 'Garoa congelante intensa',
      61: 'Chuva fraca',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      66: 'Chuva congelante fraca',
      67: 'Chuva congelante forte',
      71: 'Neve fraca',
      73: 'Neve moderada',
      75: 'Neve intensa',
      77: 'Grãos de neve',
      80: 'Pancadas de chuva fracas',
      81: 'Pancadas de chuva moderadas',
      82: 'Pancadas de chuva violentas',
      85: 'Pancadas de neve fracas',
      86: 'Pancadas de neve intensas',
      95: 'Tempestade',
      96: 'Tempestade com granizo fraco',
      99: 'Tempestade com granizo forte',
    }
    return map[code] ?? 'Condição desconhecida'
  },

  /**
   * Mapeia wind_direction (graus) para direção cardeal
   */
  windDirection(degrees) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return dirs[Math.round(degrees / 22.5) % 16]
  },

  /**
   * Traduz weather_code para ícone Lucide
   */
  weatherIcon(code) {
    if (code === 0 || code === 1) return 'Sun'
    if (code === 2) return 'CloudSun'
    if (code === 3 || code >= 45 && code <= 48) return 'Cloud'
    if (code >= 51 && code <= 57) return 'CloudDrizzle'
    if (code >= 61 && code <= 67) return 'CloudRain'
    if (code >= 71 && code <= 77) return 'CloudSnow'
    if (code >= 80 && code <= 82) return 'CloudRainWind'
    if (code >= 85 && code <= 86) return 'CloudSnow'
    if (code >= 95) return 'CloudLightning'
    return 'Cloud'
  },
}