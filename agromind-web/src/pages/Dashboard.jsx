import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle, ArrowRight, ChevronRight, CloudSun, Droplet, MapPin, Thermometer, Wind
} from 'lucide-react'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { EmptyState, Skeleton } from '../components/ui/Primitives'

function farmPinIcon() {
  const html = renderToStaticMarkup(<MapPin size={13} color="#fff" strokeWidth={2.5} fill="#15803d" />)
  return L.divIcon({
    html: `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${html}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 24],
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const dashboard = useAsync(() => agromindService.dashboard(), [])

  const farms = dashboard.data?.farms ?? []
  const mappable = useMemo(() => farms.filter(f => f.latitude && f.longitude), [farms])
  const mapCenter = mappable.length
    ? [mappable[0].latitude, mappable[0].longitude]
    : [-15.78, -47.93] // fallback: centro do Brasil, só quando ninguém tem coordenada ainda

  const primaryFarm = farms[0]
  const weather = dashboard.data?.primaryFarmWeather
  const alerts = dashboard.data?.recentAlerts ?? []

  if (dashboard.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[440px]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!farms.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="Nenhuma fazenda cadastrada"
        text="Cadastre sua primeira fazenda para começar a monitorar suas operações."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        {/* Mapa com pin por fazenda (sem poligono de talhao - ainda nao ha geometria cadastrada) */}
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col h-[440px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Visão da operação</h2>
            <button
              onClick={() => navigate('/fazendas')}
              className="text-xs font-semibold text-[#22c55e] border border-[#22c55e]/25 rounded-lg px-3 py-1.5 hover:bg-[#22c55e]/10 transition flex items-center gap-1.5"
            >
              Ver todas as fazendas <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden relative border border-white/[0.02]">
            <MapContainer center={mapCenter} zoom={mappable.length > 1 ? 6 : 12} className="h-full w-full z-0" zoomControl={false}>
              <ZoomControl position="topleft" />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
              {mappable.map(farm => (
                <Marker key={farm.id} position={[farm.latitude, farm.longitude]} icon={farmPinIcon()} />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Coluna lateral: fazenda principal + alertas */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white">{primaryFarm.nome}</h2>
                <p className="text-[11px] text-[#737373]">{primaryFarm.cidade}, {primaryFarm.estado}</p>
              </div>
            </div>

            {weather ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Thermometer size={14} className="text-red-400 shrink-0" />
                  <div>
                    <p className="text-[#737373] leading-none">Temperatura</p>
                    <p className="text-white font-bold text-sm">{weather.temperature.toFixed(1)}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet size={14} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[#737373] leading-none">Umidade</p>
                    <p className="text-white font-bold text-sm">{weather.humidity.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind size={14} className="text-[#a3a3a3] shrink-0" />
                  <div>
                    <p className="text-[#737373] leading-none">Vento</p>
                    <p className="text-white font-bold text-sm">{weather.windSpeed.toFixed(0)} km/h</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#737373]">Sem dados climáticos sincronizados ainda para esta fazenda.</p>
            )}

            <button
              onClick={() => navigate('/fazendas', { state: { focusFarmId: primaryFarm.id } })}
              className="text-xs font-semibold text-[#22c55e] mt-3 flex items-center hover:underline"
            >
              Ver detalhes da fazenda <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>

          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Alertas ativos</h2>
              <button
                onClick={() => navigate('/alertas')}
                className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center gap-0.5"
              >
                Ver todos ({dashboard.data?.alertasAtivos ?? 0}) <ChevronRight size={14} />
              </button>
            </div>

            {alerts.length ? (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded-xl border bg-red-500/10 border-red-500/20 flex items-start gap-3">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-500" />
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{alert.tipoLabel}</p>
                        <p className="text-xs text-[#737373] mt-0.5">{alert.farmNome}</p>
                      </div>
                      <span className="text-[11px] text-[#737373] font-mono shrink-0">
                        {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#737373]">Nenhum alerta ativo no momento.</p>
            )}
          </div>
        </div>
      </div>

      {/* Condicoes meteorologicas resumidas — previsao completa fica na aba Clima */}
      <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Condições meteorológicas</h3>
          <button
            onClick={() => navigate('/clima')}
            className="text-xs font-semibold text-[#22c55e] flex items-center hover:underline"
          >
            Ver previsão completa <ChevronRight size={14} className="ml-0.5" />
          </button>
        </div>
        {weather ? (
          <div className="flex items-center gap-4 mt-3">
            <CloudSun size={36} className="text-amber-400" />
            <div>
              <p className="text-3xl font-black text-white leading-none">{weather.temperature.toFixed(0)}°C</p>
              <p className="text-xs text-[#737373] mt-1">Atualizado às {new Date(weather.measuredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#737373] mt-3">Sem sincronização climática recente.</p>
        )}
      </div>
    </div>
  )
}