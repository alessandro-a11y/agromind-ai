import { useMemo, useState } from 'react'
import {
  Bar, ComposedChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  AlertTriangle, Bell, Calendar, ChevronDown, Cloud, CloudDrizzle, CloudRain, CloudSun,
  Download, Droplet, Droplets, Gauge, RefreshCw, Sprout, Sun, Sunrise, Thermometer,
  Tractor, Wind, Zap, ShieldCheck
} from 'lucide-react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { weatherSeries } from '../data/operations'
import { Button, Card, CardHeader, EmptyState, Select, Skeleton, Toast } from '../components/ui/Primitives'

// ── Mock/apoio: dados que ainda não vêm da API ──────────────────────────
// TODO: substituir por resposta real do backend quando os endpoints existirem.
const forecastDays = [
  { day: 'Ter', date: '24/06', icon: CloudSun, label: 'Parcialmente nublado', tempMax: 28, tempMin: 16, rain: 10, wind: 12, windDir: 'NE' },
  { day: 'Qua', date: '25/06', icon: CloudDrizzle, label: 'Chuva fraca', tempMax: 25, tempMin: 17, rain: 80, wind: 14, windDir: 'NE' },
  { day: 'Qui', date: '26/06', icon: Sun, label: 'Ensolarado', tempMax: 27, tempMin: 18, rain: 0, wind: 10, windDir: 'E' },
  { day: 'Sex', date: '27/06', icon: CloudRain, label: 'Pancadas de chuva', tempMax: 24, tempMin: 17, rain: 0, wind: 10, windDir: 'E' },
  { day: 'Sáb', date: '28/06', icon: CloudRain, label: 'Chuva moderada', tempMax: 24, tempMin: 13, rain: 90, wind: 15, windDir: 'S' },
  { day: 'Dom', date: '29/06', icon: CloudSun, label: 'Parcialmente nublado', tempMax: 23, tempMin: 15, rain: 20, wind: 15, windDir: 'SE' },
  { day: 'Seg', date: '30/06', icon: Sun, label: 'Ensolarado', tempMax: 26, tempMin: 17, rain: 0, wind: 12, windDir: 'NE' },
]

const climateAlerts = [
  { id: 1, title: 'Risco de chuva intensa', loc: 'Região Sul', time: 'Próximas 24h' },
  { id: 2, title: 'Temperaturas acima da média', loc: 'Região Oeste', time: 'Próximos 3 dias' },
  { id: 3, title: 'Baixa umidade do ar', loc: 'Região Norte', time: 'Próximos 2 dias' },
]

const historicalSeries = [
  { label: '01/05', rain: 4, temp: 21 }, { label: '04/05', rain: 8, temp: 22 }, { label: '08/05', rain: 22, temp: 23 },
  { label: '11/05', rain: 6, temp: 22 }, { label: '15/05', rain: 30, temp: 21 }, { label: '18/05', rain: 10, temp: 22 },
  { label: '22/05', rain: 5, temp: 23 }, { label: '25/05', rain: 12, temp: 22 }, { label: '28/05', rain: 3, temp: 21 },
  { label: '31/05', rain: 7, temp: 22 },
]

const recommendations = [
  { icon: Droplet, color: '#38bdf8', title: 'Manejo de irrigação', text: 'Evapotranspiração alta prevista para os próximos dias.' },
  { icon: ShieldCheck, color: '#22c55e', title: 'Aplicação de defensivos', text: 'Janela favorável para aplicação nos próximos 2 dias.' },
  { icon: Tractor, color: '#f97316', title: 'Colheita', text: 'Condições favoráveis para colheita até sexta-feira.' },
  { icon: Sprout, color: '#a3e635', title: 'Plantio', text: 'Aguarde melhora nas condições de umidade do solo.' },
]

function TopStatCard({ children }) {
  return <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">{children}</div>
}

export default function Clima() {
  const farms = useAsync(() => agromindService.farms(), [])
  const [farmId, setFarmId] = useState('')
  const [toast, setToast] = useState('')

  const selectedFarmId = farmId || farms.data?.[0]?.id
  const weather = useAsync(
    () => selectedFarmId ? agromindService.weather(selectedFarmId) : Promise.resolve(null),
    [selectedFarmId],
  )

  const current = weather.data ?? {
    temperature: 24.6,
    feelsLike: 25,
    humidity: 65,
    windSpeed: 12,
    windDir: 'NE',
    rainProbability: 40,
    rain7d: 68,
    rainForecast7d: 22,
    tempMax: 28.7,
    tempMin: 16.2,
    solarRadiation: 650,
    evapotranspiration: 4.2,
    dewPoint: 17.1,
    pressure: 1015,
    measuredAt: new Date().toISOString(),
    stationOnline: true,
  }

  const refresh = async () => {
    await Promise.all([farms.refresh(), weather.refresh()])
    setToast('Dados climáticos atualizados.')
  }

  const selectedFarm = useMemo(() => farms.data?.find(farm => farm.id === selectedFarmId), [farms.data, selectedFarmId])

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CloudSun size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">Clima</h1>
            <p className="text-sm text-muted">Acompanhe as condições meteorológicas e previsões para suas fazendas.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedFarmId ?? ''} onChange={event => setFarmId(event.target.value)} disabled={farms.loading || !farms.data?.length}>
            <option value="">Todas as fazendas</option>
            {(farms.data ?? []).map(farm => <option key={farm.id} value={farm.id}>{farm.nome}</option>)}
          </Select>
          <Button variant="secondary" className="gap-1.5">
            <Calendar size={15} /> 23/06/2026 – 29/06/2026 <ChevronDown size={14} />
          </Button>
          <span className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
            Atualizado há 8 min
            <button onClick={refresh} className="rounded-full p-1 hover:bg-surface-muted transition" aria-label="Atualizar">
              <RefreshCw size={13} />
            </button>
          </span>
        </div>
      </div>

      {farms.error ? (
        <div className="p-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-red-400">Erro ao carregar fazendas: {farms.error.message ?? 'Falha na requisição'}</p>
            <div className="flex gap-2">
              <Button onClick={() => farms.refresh()}>Tentar novamente</Button>
            </div>
          </div>
        </div>
      ) : !farms.loading && !farms.data?.length ? (
        <EmptyState icon={CloudSun} title="Nenhuma fazenda cadastrada" text="Cadastre uma fazenda para consultar o clima pela API." />
      ) : (
        <>
          {/* 4 cards principais */}
          <div className="grid gap-4 lg:grid-cols-4">
            {weather.loading ? Array.from({ length: 4 }).map((_, i) => (
              <TopStatCard key={i}><Skeleton className="h-32" /></TopStatCard>
            )) : (
              <>
                {/* Condições atuais */}
                <TopStatCard>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Condições atuais</h3>
                    {current.stationOnline && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-[#22c55e]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" /> Estação instalada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#737373] mt-0.5">{selectedFarm?.nome ?? 'Fazenda Santa Clara'} • Talhão 12</p>
                  <div className="flex items-center gap-3 mt-3">
                    <CloudSun size={38} className="text-amber-400" />
                    <div>
                      <p className="text-3xl font-black text-white leading-none">{current.temperature?.toFixed?.(1) ?? current.temperature}°C</p>
                      <p className="text-xs text-[#737373] mt-1">Parcialmente nublado</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.03] text-xs">
                    <div>
                      <p className="text-[#525252] text-[10px]">Sensação térmica</p>
                      <p className="text-white font-semibold mt-0.5">{current.feelsLike}°C</p>
                    </div>
                    <div>
                      <p className="text-[#525252] text-[10px] flex items-center gap-1"><Wind size={10} /> Vento</p>
                      <p className="text-white font-semibold mt-0.5">{current.windSpeed} km/h {current.windDir}</p>
                    </div>
                    <div>
                      <p className="text-[#525252] text-[10px] flex items-center gap-1"><Droplet size={10} /> Umidade</p>
                      <p className="text-white font-semibold mt-0.5">{current.humidity}%</p>
                    </div>
                  </div>
                </TopStatCard>

                {/* Precipitação */}
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-white">Precipitação</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <CloudRain size={34} className="text-blue-400" />
                    <div>
                      <p className="text-3xl font-black text-white leading-none">{current.rain7d}<span className="text-base font-bold ml-1">mm</span></p>
                      <p className="text-xs text-[#737373] mt-1">Últimos 7 dias</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.03] text-xs">
                    <div>
                      <p className="text-[#525252] text-[10px]">Probabilidade de chuva</p>
                      <p className="text-white font-bold text-sm mt-0.5">{current.rainProbability}%<span className="text-[10px] font-normal text-[#525252] ml-1">Próximas 24h</span></p>
                    </div>
                    <div>
                      <p className="text-[#525252] text-[10px]">Previsão acumulada</p>
                      <p className="text-white font-bold text-sm mt-0.5">{current.rainForecast7d} mm<span className="text-[10px] font-normal text-[#525252] ml-1">Próximos 7 dias</span></p>
                    </div>
                  </div>
                </TopStatCard>

                {/* Temperatura */}
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-white">Temperatura</h3>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <Thermometer size={16} className="text-red-400" />
                      <div>
                        <p className="text-[10px] text-[#525252]">Máxima</p>
                        <p className="text-red-400 font-bold text-lg leading-none">{current.tempMax}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Thermometer size={16} className="text-blue-400" />
                      <div>
                        <p className="text-[10px] text-[#525252]">Mínima</p>
                        <p className="text-blue-400 font-bold text-lg leading-none">{current.tempMin}°C</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-20 mt-3">
                    <ResponsiveContainer>
                      <LineChart data={weatherSeries}>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} />
                        <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TopStatCard>

                {/* Outros índices */}
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-white mb-3">Outros índices</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#a3a3a3] flex items-center gap-1.5"><Zap size={13} className="text-amber-400" /> Radiação solar</span>
                      <span className="text-white font-semibold">{current.solarRadiation} <span className="text-[10px] text-[#525252] font-normal">W/m²</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#a3a3a3] flex items-center gap-1.5"><Droplets size={13} className="text-blue-400" /> Evapotranspiração (ET₀)</span>
                      <span className="text-white font-semibold">{current.evapotranspiration} <span className="text-[10px] text-[#525252] font-normal">mm</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#a3a3a3] flex items-center gap-1.5"><Sunrise size={13} className="text-emerald-400" /> Ponto de orvalho</span>
                      <span className="text-white font-semibold">{current.dewPoint} <span className="text-[10px] text-[#525252] font-normal">°C</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#a3a3a3] flex items-center gap-1.5"><Gauge size={13} className="text-violet-400" /> Pressão atmosférica</span>
                      <span className="text-white font-semibold">{current.pressure} <span className="text-[10px] text-[#525252] font-normal">hPa</span></span>
                    </div>
                  </div>
                </TopStatCard>
              </>
            )}
          </div>

          {/* Previsão 7 dias + Mapa + Alertas/Histórico/Personalizar */}
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_360px]">
            {/* Previsão do tempo */}
            <TopStatCard>
              <h3 className="text-sm font-semibold text-white">Previsão do tempo</h3>
              <p className="text-[11px] text-[#737373] mb-3">Próximos 7 dias</p>
              <div className="grid grid-cols-4 gap-y-4 gap-x-1 text-center sm:grid-cols-7 xl:grid-cols-4 2xl:grid-cols-7">
                {forecastDays.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <div key={i}>
                      <p className="text-xs font-semibold text-white">{f.day}</p>
                      <p className="text-[9px] text-[#525252] font-mono">{f.date}</p>
                      <div className="my-2 flex justify-center"><Icon size={26} className="text-[#a3a3a3]" /></div>
                      <p className="text-[10px] text-[#737373] leading-tight px-0.5">{f.label}</p>
                      <p className="text-sm font-bold text-red-400 mt-1.5">{f.tempMax}°</p>
                      <p className="text-xs text-blue-400">{f.tempMin}°</p>
                      <p className="text-[9px] text-[#525252] mt-1">💧 {f.rain}%</p>
                      <p className="text-[9px] text-[#525252]">💨 {f.wind} km/h</p>
                    </div>
                  )
                })}
              </div>
              <button className="text-xs font-semibold text-[#22c55e] mt-4 flex items-center hover:underline">
                Ver previsão detalhada <ChevronDown size={14} className="ml-0.5 -rotate-90" />
              </button>
            </TopStatCard>

            {/* Mapa de precipitação (placeholder decorativo) */}
            <TopStatCard>
              <h3 className="text-sm font-semibold text-white">Mapa de precipitação</h3>
              <p className="text-[11px] text-[#737373] mb-3">Acumulado previsto para os próximos 7 dias</p>
              <div className="h-[220px] rounded-lg overflow-hidden relative border border-white/[0.02]">
                <MapContainer center={[-24.5, -52.6]} zoom={6} className="h-full w-full z-0" zoomControl={false}>
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
                </MapContainer>
                {/* Overlay decorativo — TODO: substituir por camada real de precipitação (ex: OpenWeather layer) */}
                <div
                  className="absolute inset-0 z-[400] pointer-events-none mix-blend-screen opacity-70"
                  style={{
                    background: 'radial-gradient(ellipse 45% 55% at 45% 55%, #7c3aed99, #2563eb88 35%, #22c55e66 55%, #eab30844 70%, transparent 85%)',
                  }}
                />
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full" style={{ background: 'linear-gradient(90deg,#2563eb,#22c55e,#eab308,#dc2626,#7c3aed)' }} />
                <div className="flex justify-between text-[10px] text-[#737373] mt-1 font-mono">
                  <span>0</span><span>10</span><span>25</span><span>50</span><span>75</span><span>100</span><span>150+</span>
                </div>
                <p className="text-[10px] text-[#525252] mt-1">mm</p>
              </div>
              <button className="text-xs font-semibold text-[#22c55e] mt-2 flex items-center hover:underline">
                Ver mapa ampliado <ChevronDown size={14} className="ml-0.5 -rotate-90" />
              </button>
            </TopStatCard>

            {/* Coluna: Alertas + Histórico + Personalizar */}
            <div className="flex flex-col gap-4">
              <TopStatCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Alertas climáticos</h3>
                  <button className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center gap-0.5">
                    Ver todos ({climateAlerts.length}) <ChevronDown size={13} className="-rotate-90" />
                  </button>
                </div>
                <div className="space-y-2">
                  {climateAlerts.map(a => (
                    <div key={a.id} className="p-2.5 rounded-xl border bg-amber-500/10 border-amber-500/20 flex items-start gap-2.5">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-white">{a.title}</p>
                          <p className="text-[10.5px] text-[#737373] mt-0.5">{a.loc}</p>
                        </div>
                        <span className="text-[10px] text-[#737373] font-mono shrink-0 whitespace-nowrap">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TopStatCard>

              <TopStatCard>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-white">Histórico climático</h3>
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                    <Download size={13} /> Baixar relatório
                  </Button>
                </div>
                <p className="text-[11px] text-[#737373] mb-3">Maio/2026</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[#525252]">Chuva acumulada</p>
                    <p className="text-xl font-black text-white">142 <span className="text-xs font-normal text-[#737373]">mm</span></p>
                    <p className="text-[10px] text-[#22c55e] mt-0.5">+18% vs. média histórica</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#525252]">Temperatura média</p>
                    <p className="text-xl font-black text-white">22,1 <span className="text-xs font-normal text-[#737373]">°C</span></p>
                    <p className="text-[10px] text-red-400 mt-0.5">+1,2°C vs. média histórica</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 mb-1 text-[10px] text-[#737373]">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Chuva (mm)</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Temp. média (°C)</span>
                </div>
                <div className="h-20">
                  <ResponsiveContainer>
                    <ComposedChart data={historicalSeries}>
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#525252' }} axisLine={false} tickLine={false} interval={2} />
                      <Bar dataKey="rain" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={6} />
                      <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <button className="text-xs font-semibold text-[#22c55e] mt-2 flex items-center hover:underline">
                  Ver histórico completo <ChevronDown size={13} className="ml-0.5 -rotate-90" />
                </button>
              </TopStatCard>

              <TopStatCard>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Personalizar alertas</p>
                    <p className="text-[11px] text-[#737373] mt-0.5">Configure alertas climáticos para suas fazendas.</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-[#22c55e] mt-2.5 flex items-center hover:underline">
                  Configurar <ChevronDown size={13} className="ml-0.5 -rotate-90" />
                </button>
              </TopStatCard>
            </div>
          </div>

          {/* Recomendações com base no clima */}
          <TopStatCard>
            <div className="flex items-center gap-2 mb-3">
              <Sprout size={15} className="text-[#22c55e]" />
              <h3 className="text-sm font-semibold text-white">Recomendações com base no clima</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {recommendations.map((rec, i) => {
                const Icon = rec.icon
                return (
                  <div key={i} className="rounded-xl border border-white/[0.03] bg-[#161916] p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-2.5" style={{ backgroundColor: `${rec.color}22` }}>
                      <Icon size={15} style={{ color: rec.color }} />
                    </div>
                    <p className="text-sm font-bold text-white">{rec.title}</p>
                    <p className="text-[11.5px] text-[#737373] mt-1 leading-snug">{rec.text}</p>
                    <button className="text-[11.5px] font-semibold text-[#22c55e] mt-2 flex items-center hover:underline">
                      Ver recomendação <ChevronDown size={12} className="ml-0.5 -rotate-90" />
                    </button>
                  </div>
                )
              })}
            </div>
          </TopStatCard>
        </>
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}