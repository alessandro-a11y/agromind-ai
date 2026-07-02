export const fieldShapes = [
  { id: 'shape-1', nome: 'Talhao 8', cultura: 'Soja', area: 120, healthIndex: 85, coords: [[-24.035,-52.385],[-24.015,-52.360],[-24.030,-52.345],[-24.050,-52.370]] },
  { id: 'shape-2', nome: 'Talhao 12', cultura: 'Soja', area: 45, healthIndex: 42, coords: [[-24.010,-52.380],[-23.995,-52.358],[-24.008,-52.342],[-24.023,-52.364]] },
  { id: 'shape-3', nome: 'Talhao 7', cultura: 'Milho', area: 80, healthIndex: 64, coords: [[-24.052,-52.358],[-24.035,-52.336],[-24.048,-52.320],[-24.065,-52.342]] },
  { id: 'shape-4', nome: 'Talhao 3', cultura: 'Algodao', area: 60, healthIndex: 78, coords: [[-23.998,-52.400],[-23.980,-52.378],[-23.993,-52.362],[-24.011,-52.384]] },
  { id: 'shape-5', nome: 'Talhao 5', cultura: 'Milho', area: 95, healthIndex: 90, coords: [[-24.068,-52.375],[-24.050,-52.353],[-24.063,-52.337],[-24.081,-52.359]] },
]

export const weatherSeries = [
  { label: 'Seg', temp: 25, rain: 8, humidity: 67 },
  { label: 'Ter', temp: 27, rain: 3, humidity: 63 },
  { label: 'Qua', temp: 24, rain: 21, humidity: 76 },
  { label: 'Qui', temp: 26, rain: 0, humidity: 60 },
  { label: 'Sex', temp: 28, rain: 2, humidity: 58 },
  { label: 'Sab', temp: 23, rain: 28, humidity: 80 },
  { label: 'Dom', temp: 24, rain: 11, humidity: 72 },
]

export const healthTrend = [
  { label: '01/06', health: 72, water: 58, risk: 38 },
  { label: '06/06', health: 75, water: 60, risk: 35 },
  { label: '11/06', health: 77, water: 62, risk: 34 },
  { label: '16/06', health: 80, water: 65, risk: 31 },
  { label: '21/06', health: 78, water: 63, risk: 36 },
  { label: '26/06', health: 82, water: 66, risk: 29 },
  { label: '02/07', health: 84, water: 68, risk: 26 },
]

export const cropMix = [
  { name: 'Soja', value: 48, color: '#256f49' },
  { name: 'Milho', value: 27, color: '#a66812' },
  { name: 'Trigo', value: 14, color: '#256d8f' },
  { name: 'Algodao', value: 11, color: '#7c3aed' },
]

export const recommendations = [
  { title: 'Priorizar vistoria', text: 'Talhoes com indice abaixo de 60 devem entrar na rota de amostragem de hoje.' },
  { title: 'Janela operacional', text: 'Ha previsao de estabilidade para aplicacao nas proximas 36 horas.' },
  { title: 'Irrigacao', text: 'Areas arenosas devem receber ajuste fino por leitura de umidade.' },
]

export const fallbackFarms = [
  { id: 'demo-1', nome: 'Fazenda Santa Clara', cidade: 'Campo Mourao', estado: 'PR', latitude: -24.038, longitude: -52.373, fieldsCount: 5, healthIndex: 82, activeAlerts: 3, status: 'Active' },
  { id: 'demo-2', nome: 'Fazenda Boa Vista', cidade: 'Cascavel', estado: 'PR', latitude: -24.95, longitude: -53.45, fieldsCount: 3, healthIndex: 76, activeAlerts: 1, status: 'Active' },
]
