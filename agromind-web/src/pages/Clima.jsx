import { useEffect, useMemo, useState } from 'react'
import {
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  Cloud, CloudDrizzle, CloudRain, CloudSun, CloudLightning, CloudSnow,
  Droplet, Gauge, MapPin, RefreshCw, Sunrise, Sun, Thermometer, Wind, Zap
} from 'lucide-react'
import { agromindService } from '../services/agromind'
import { weatherService } from '../services/weather'
import { useAsync } from '../hooks/useAsync'
import { Button, Card, CardHeader, EmptyState, Select, Skeleton, Toast } from '../components/ui/Primitives'

function TopStatCard({ children }) {
  return <Card className="p-4">{children}</Card>
}

function getWeatherIcon(code, size = 26) {
  const icon = weatherService.weatherIcon(code)
  const icons = {
    Sun: <Sun size={size} className="text-warning" />,
    CloudSun: <CloudSun size={size} className="text-warning" />,
    Cloud: <Cloud size={size} className="text-muted" />,
    CloudDrizzle: <CloudDrizzle size={size} className="text-info" />,
    CloudRain: <CloudRain size={size} className="text-info" />,
    CloudRainWind: <CloudRain size={size} className="text-info" />,
    CloudSnow: <CloudSnow size={size} className="text-info" />,
    CloudLightning: <CloudLightning size={size} className="text-danger" />,
  }
  return icons[icon] ?? <CloudSun size={size} className="text-warning" />
}

export default function Clima() {
  const farms = useAsync(() => agromindService.farms(), [])
  const [farmId, setFarmId] = useState('')
  const [toast, setToast] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const selectedFarm = useMemo(() => {
    const id = farmId || farms.data?.[0]?.id
    return farms.data?.find(f => f.id === id) ?? farms.data?.[0] ?? null
  }, [farms.data, farmId])

  // Busca clima real do Open-Meteo sempre que a fazenda selecionada mudar
  useEffect(() => {
    if (!selectedFarm?.latitude || !selectedFarm?.longitude) return

    setWeatherLoading(true)
    weatherService.getCurrent(selectedFarm.latitude, selectedFarm.longitude)
      .then(data => {
        setWeatherData(data)
        setLastUpdate(new Date())
      })
      .catch(() => setWeatherData(null))
      .finally(() => setWeatherLoading(false))
  }, [selectedFarm?.latitude, selectedFarm?.longitude])

  const current = weatherData?.current
  const daily = weatherData?.daily

  // Previsão formatada para exibição
  const forecast = useMemo(() => {
    if (!daily) return []
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return daily.time.map((date, i) => {
      const d = new Date(date + 'T12:00:00')
      return {
        day: daysOfWeek[d.getDay()],
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        rain: daily.precipitation_sum[i],
        rainProb: daily.precipitation_probability_max?.[i] ?? 0,
        wind: daily.wind_speed_10m_max?.[i] ?? 0,
        windDir: daily.wind_direction_10m_dominant?.[i] 
          ? weatherService.windDirection(daily.wind_direction_10m_dominant[i]) 
          : '—',
        weatherCode: daily.weather_code[i],
        description: weatherService.weatherDescription(daily.weather_code[i]),
        sunrise: daily.sunrise?.[i],
        sunset: daily.sunset?.[i],
        uvIndex: daily.uv_index_max?.[i],
      }
    })
  }, [daily])

  // Dados para o gráfico de temperatura
  const chartData = useMemo(() => {
    if (!daily) return []
    return daily.time.map((date, i) => ({
      label: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
    }))
  }, [daily])

  const refresh = async () => {
    if (!selectedFarm?.latitude || !selectedFarm?.longitude) return
    setWeatherLoading(true)
    try {
      const data = await weatherService.getCurrent(selectedFarm.latitude, selectedFarm.longitude)
      setWeatherData(data)
      setLastUpdate(new Date())
      setToast('Dados climáticos atualizados.')
    } catch {
      setToast('Erro ao atualizar dados.')
    } finally {
      setWeatherLoading(false)
    }
  }

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
            <p className="text-sm text-muted">Condições meteorológicas em tempo real para suas fazendas.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select 
            value={selectedFarm?.id ?? ''} 
            onChange={event => setFarmId(event.target.value)} 
            disabled={farms.loading || !farms.data?.length}
          >
            {farms.data?.length > 1 && <option value="">Todas as fazendas</option>}
            {(farms.data ?? []).map(farm => (
              <option key={farm.id} value={farm.id}>{farm.nome}</option>
            ))}
          </Select>
          {lastUpdate && (
            <span className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
              Atualizado {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              <button onClick={refresh} disabled={weatherLoading} className="rounded-full p-1 hover:bg-surface-muted transition disabled:opacity-50" aria-label="Atualizar">
                <RefreshCw size={13} className={weatherLoading ? 'animate-spin' : ''} />
              </button>
            </span>
          )}
        </div>
      </div>

      {farms.error ? (
        <div className="p-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-danger">Erro ao carregar fazendas.</p>
            <Button onClick={() => farms.refresh()}>Tentar novamente</Button>
          </div>
        </div>
      ) : !farms.loading && !farms.data?.length ? (
        <EmptyState icon={CloudSun} title="Nenhuma fazenda cadastrada" text="Cadastre uma fazenda com coordenadas para ver o clima em tempo real." />
      ) : !selectedFarm?.latitude || !selectedFarm?.longitude ? (
        <EmptyState icon={MapPin} title="Fazenda sem coordenadas" text="Edite a fazenda e informe latitude/longitude para ativar o clima." />
      ) : (
        <>
          {/* Cards principais */}
          <div className="grid gap-4 lg:grid-cols-4">
            {weatherLoading ? Array.from({ length: 4 }).map((_, i) => (
              <TopStatCard key={i}><Skeleton className="h-32" /></TopStatCard>
            )) : current ? (
              <>
                {/* Condições atuais */}
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-ink mb-1">Condições atuais</h3>
                  <p className="text-xs text-muted mb-3">{selectedFarm.nome}</p>
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(current.weather_code, 38)}
                    <div>
                      <p className="text-3xl font-black text-ink leading-none">{current.temperature_2m?.toFixed(1)}°C</p>
                      <p className="text-xs text-muted mt-1">{weatherService.weatherDescription(current.weather_code)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/40 text-xs">
                    <div>
                      <p className="text-muted text-[10px]">Sensação</p>
                      <p className="text-ink font-semibold mt-0.5">{current.apparent_temperature?.toFixed(1)}°C</p>
                    </div>
                    <div>
                      <p className="text-muted text-[10px] flex items-center gap-1"><Wind size={10} /> Vento</p>
                      <p className="text-ink font-semibold mt-0.5">{current.wind_speed_10m?.toFixed(0)} km/h</p>
                    </div>
                    <div>
                      <p className="text-muted text-[10px] flex items-center gap-1"><Droplet size={10} /> Umidade</p>
                      <p className="text-ink font-semibold mt-0.5">{current.relative_humidity_2m}%</p>
                    </div>
                  </div>
                </TopStatCard>

                {/* Precipitação */}
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-ink">Precipitação</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <CloudRain size={34} className="text-info" />
                    <div>
                      <p className="text-3xl font-black text-ink leading-none">{current.precipitation?.toFixed(1) ?? '0'}<span className="text-base font-bold ml-1">mm</span></p>
                      <p className="text-xs text-muted mt-1">Agora</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/40 text-xs">
                    <div>
                      <p className="text-muted text-[10px]">Cobertura de nuvens</p>
                      <p className="text-ink font-bold text-sm mt-0.5">{current.cloud_cover ?? '—'}%</p>
                    </div>
                    <div>
                      <p className="text-muted text-[10px]">Rajada máxima</p>
                      <p className="text-ink font-bold text-sm mt-0.5">{current.wind_gusts_10m?.toFixed(0) ?? '—'} km/h</p>
                    </div>
                  </div>
                </TopStatCard>

                {/* Temperatura */}
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-ink">Temperatura</h3>
                  {forecast.length > 0 && (
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <Thermometer size={16} className="text-danger" />
                        <div>
                          <p className="text-[10px] text-muted">Máxima hoje</p>
                          <p className="text-danger font-bold text-lg leading-none">{forecast[0].tempMax}°C</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Thermometer size={16} className="text-info" />
                        <div>
                          <p className="text-[10px] text-muted">Mínima hoje</p>
                          <p className="text-info font-bold text-lg leading-none">{forecast[0].tempMin}°C</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="h-20 mt-3">
                    <ResponsiveContainer>
                      <LineChart data={chartData}>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#737373' }} axisLine={false} tickLine={false} />
                        <Line type="monotone" dataKey="tempMax" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="tempMin" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TopStatCard>

                {/* Outros índices */}
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-ink mb-3">Outros índices</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1.5"><Zap size={13} className="text-warning" /> Índice UV</span>
                      <span className="text-ink font-semibold">{current.uv_index?.toFixed(1) ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1.5"><Gauge size={13} className="text-violet-400" /> Pressão</span>
                      <span className="text-ink font-semibold">{current.pressure_msl?.toFixed(0) ?? '—'} hPa</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1.5"><Wind size={13} /> Direção vento</span>
                      <span className="text-ink font-semibold">
                        {current.wind_direction_10m != null ? weatherService.windDirection(current.wind_direction_10m) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1.5"><Cloud size={13} /> Cobertura</span>
                      <span className="text-ink font-semibold">{current.cloud_cover ?? '—'}%</span>
                    </div>
                  </div>
                </TopStatCard>
              </>
            ) : (
              <div className="lg:col-span-4">
                <EmptyState icon={CloudSun} title="Sem dados climáticos" text="Não foi possível carregar os dados. Verifique as coordenadas da fazenda." />
              </div>
            )}
          </div>

          {/* Previsão 7 dias + histórico */}
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_360px]">
            {/* Previsão do tempo */}
            <TopStatCard>
              <h3 className="text-sm font-semibold text-ink">Previsão do tempo</h3>
              {forecast.length > 0 ? (
                <>
                  <p className="text-xs text-muted mb-3">Próximos {forecast.length} dias</p>
                  <div className="grid grid-cols-4 gap-y-4 gap-x-1 text-center sm:grid-cols-7 xl:grid-cols-4 2xl:grid-cols-7">
                    {forecast.map((f, i) => (
                      <div key={i}>
                        <p className="text-xs font-semibold text-ink">{f.day}</p>
                        <p className="text-[9px] text-muted font-mono">{f.date}</p>
                        <div className="my-2 flex justify-center">{getWeatherIcon(f.weatherCode, 26)}</div>
                        <p className="text-[10px] text-muted leading-tight px-0.5">{f.description}</p>
                        <p className="text-sm font-bold text-danger mt-1.5">{f.tempMax}°</p>
                        <p className="text-xs text-info">{f.tempMin}°</p>
                        <p className="text-[9px] text-muted mt-1">💧 {f.rainProb}%</p>
                        <p className="text-[9px] text-muted">💨 {f.wind} km/h</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted mt-2">Carregando previsão...</p>
              )}
            </TopStatCard>

            {/* Gráfico de temperatura (simplificado, sem mapa falso) */}
            <TopStatCard>
              <h3 className="text-sm font-semibold text-ink">Tendência de temperatura</h3>
              <p className="text-xs text-muted mb-3">Máximas e mínimas dos próximos dias</p>
              {chartData.length > 0 ? (
                <div className="h-[220px]">
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip
                        contentStyle={{ background: '#101714', border: '1px solid #24312b', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: '#f5f8f3' }}
                      />
                      <Line type="monotone" dataKey="tempMax" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Máx" />
                      <Line type="monotone" dataKey="tempMin" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Mín" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-muted">Sem dados disponíveis.</p>
              )}
            </TopStatCard>

            {/* Nascer/pôr do sol + alertas */}
            <div className="flex flex-col gap-4">
              {forecast[0] && (
                <TopStatCard>
                  <h3 className="text-sm font-semibold text-ink mb-3">Sol</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1.5"><Sunrise size={13} className="text-warning" /> Nascer</span>
                      <span className="text-ink font-semibold">
                        {forecast[0].sunrise ? new Date(forecast[0].sunrise).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1.5"><Sun size={13} className="text-warning" /> Pôr</span>
                      <span className="text-ink font-semibold">
                        {forecast[0].sunset ? new Date(forecast[0].sunset).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1.5"><Zap size={13} className="text-warning" /> UV máximo</span>
                      <span className="text-ink font-semibold">{forecast[0].uvIndex?.toFixed(1) ?? '—'}</span>
                    </div>
                  </div>
                </TopStatCard>
              )}

              <TopStatCard>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <RefreshCw size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">Dados em tempo real</p>
                    <p className="text-xs text-muted mt-0.5">Fonte: Open-Meteo (gratuito, sem chave de API).</p>
                  </div>
                </div>
              </TopStatCard>
            </div>
          </div>
        </>
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}