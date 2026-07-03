import { MapContainer, Marker, Polygon, TileLayer, ZoomControl } from 'react-leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  CloudSun,
  Droplet,
  Thermometer,
  Leaf,
  Sprout,
  Tractor,
  CloudRain,
  Sun,
  Cloud
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const fieldShapes = [
  { id: 3,  nome: 'Talhão 3',  coords: [[-24.150, -52.505], [-24.148, -52.494], [-24.156, -52.491], [-24.159, -52.502]], healthIndex: 88, color: '#15803d' },
  { id: 5,  nome: 'Talhão 5',  coords: [[-24.148, -52.494], [-24.146, -52.483], [-24.153, -52.480], [-24.156, -52.491]], healthIndex: 80, color: '#4d7c0f' },
  { id: 7,  nome: 'Talhão 7',  coords: [[-24.159, -52.502], [-24.156, -52.491], [-24.163, -52.489], [-24.166, -52.500]], healthIndex: 62, color: '#a16207' },
  { id: 12, nome: 'Talhão 12', coords: [[-24.156, -52.491], [-24.153, -52.480], [-24.160, -52.478], [-24.163, -52.489]], healthIndex: 38, color: '#b91c1c' },
  { id: 8,  nome: 'Talhão 8',  coords: [[-24.166, -52.500], [-24.163, -52.489], [-24.170, -52.487], [-24.173, -52.498]], healthIndex: 90, color: '#15803d' },
]

const recentActivities = [
  { id: 1, title: 'Plantio concluído no Talhão 8', desc: 'Soja • 120 ha', time: 'Hoje, 08:45', icon: Sprout, iconColor: 'text-[#22c55e]' },
  { id: 2, title: 'Aplicação realizada no Talhão 12', desc: 'Fungicida • 45 ha', time: 'Hoje, 07:30', icon: Tractor, iconColor: 'text-[#eab308]' },
  { id: 3, title: 'Colheita iniciada no Talhão 5', desc: 'Milho • 80 ha', time: 'Ontem, 16:10', icon: Leaf, iconColor: 'text-[#3b82f6]' },
  { id: 4, title: 'Irrigação programada no Talhão 3', desc: 'Algodão • 60 ha', time: '22/06/2026', icon: Droplet, iconColor: 'text-[#3b82f6]' }
]

const activeAlerts = [
  { id: 1, type: 'danger', title: 'Baixa umidade do solo', loc: 'Talhão 12 • Soja', time: '10 min atrás' },
  { id: 2, type: 'warning', title: 'Risco de praga (Lagarta)', loc: 'Talhão 7 • Milho', time: '2 h atrás' },
  { id: 3, type: 'info', title: 'Previsão de chuva intensa', loc: 'Região Sul', time: '5 h atrás' }
]

const weatherForecast = [
  { day: 'Ter', date: '24/06', icon: Sun, iconColor: 'text-amber-400', tempMax: 25, tempMin: 16, rain: 0 },
  { day: 'Qua', date: '25/06', icon: CloudRain, iconColor: 'text-blue-400', tempMax: 23, tempMin: 17, rain: 8 },
  { day: 'Qui', date: '26/06', icon: Sun, iconColor: 'text-amber-400', tempMax: 26, tempMin: 18, rain: 0 },
  { day: 'Sex', date: '27/06', icon: Cloud, iconColor: 'text-[#9ca3af]', tempMax: 24, tempMin: 17, rain: 0 },
  { day: 'Sáb', date: '28/06', icon: CloudRain, iconColor: 'text-blue-400', tempMax: 22, tempMin: 16, rain: 15 }
]

const alertStyles = {
  danger: 'bg-red-500/10 border-red-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  info: 'bg-blue-500/10 border-blue-500/20',
}
const alertIconColors = {
  danger: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

// ── Helpers do mapa: centróide do talhão + marcador (folha/alerta) ──
function centroid(coords) {
  const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length
  const lng = coords.reduce((s, c) => s + c[1], 0) / coords.length
  return [lat, lng]
}

function fieldIcon(field) {
  const isAlert = field.healthIndex < 60
  const IconComp = isAlert ? AlertTriangle : Leaf
  const bg = isAlert ? '#ef4444' : '#15803d'
  const html = renderToStaticMarkup(<IconComp size={13} color="#fff" strokeWidth={2.5} />)
  return L.divIcon({
    html: `<div style="background:${bg};width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.35);box-shadow:0 2px 6px rgba(0,0,0,0.4)">${html}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

// ── Mini sparkline decorativo pros cards de métrica ──
function Sparkline({ color, points }) {
  return (
    <svg width="52" height="20" viewBox="0 0 52 20" className="ml-auto shrink-0 opacity-90">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IndexRow({ icon: Icon, color, bg, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[11px] leading-none text-[#737373]">{label}</p>
        <p className="mt-1 text-sm font-bold text-white">{value}<span className="text-[10px] font-normal text-[#525252]">/100</span></p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const healthIndex = 82

  return (
    <div className="space-y-4">

      {/* ── SEÇÃO SUPERIOR: MAPA E PAINEL DA FAZENDA / ALERTAS ── */}
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">

        {/* Box do Mapa Georreferenciado */}
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col h-[440px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Visão da operação</h2>
            <button className="text-xs font-semibold text-[#22c55e] border border-[#22c55e]/25 rounded-lg px-3 py-1.5 hover:bg-[#22c55e]/10 transition flex items-center gap-1.5">
              Ver todas as fazendas <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex-1 rounded-lg overflow-hidden relative border border-white/[0.02]">
            <MapContainer center={[-24.158, -52.492]} zoom={14} className="h-full w-full z-0" zoomControl={false}>
              <ZoomControl position="topleft" />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
              {fieldShapes.map(field => (
                <Polygon
                  key={field.id}
                  positions={field.coords}
                  pathOptions={{ color: field.color, fillColor: field.color, fillOpacity: 0.45, weight: 1.5 }}
                />
              ))}
              {fieldShapes.map(field => (
                <Marker key={`marker-${field.id}`} position={centroid(field.coords)} icon={fieldIcon(field)} />
              ))}
            </MapContainer>

            {/* Legenda flutuante sobre o mapa */}
            <div className="absolute bottom-3 left-3 z-[400] bg-[#111311]/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2.5 max-w-[180px] shadow-lg">
              <p className="text-xs text-[#a3a3a3] font-medium mb-1.5">Índice de Saúde</p>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-700 via-yellow-600 to-green-700" />
              <div className="flex justify-between text-[10px] text-[#737373] mt-1 font-mono">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna lateral direita: Card da Fazenda + Alertas */}
        <div className="flex flex-col gap-4">

          {/* Card: Fazenda selecionada */}
          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Fazenda Santa Clara</h2>
                <p className="text-[11px] text-[#737373]">Talhão 12 • Região Sul, Paraná</p>
              </div>
              <span className="text-[10px] font-semibold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sprout size={11} /> Ativa
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Sprout size={14} className="text-[#22c55e] shrink-0" />
                <div>
                  <p className="text-[#737373] leading-none">Índice de Saúde</p>
                  <p className="text-white font-bold text-sm">{healthIndex}<span className="text-[10px] text-[#525252] font-normal">/100</span></p>
                </div>
                <Sparkline color="#22c55e" points="0,14 8,12 16,15 24,8 32,10 40,4 52,2" />
              </div>
              <div className="flex items-center gap-2">
                <Droplet size={14} className="text-blue-400 shrink-0" />
                <div>
                  <p className="text-[#737373] leading-none">Umidade do solo</p>
                  <p className="text-white font-bold text-sm">65%</p>
                </div>
                <Sparkline color="#60a5fa" points="0,6 8,10 16,7 24,13 32,9 40,15 52,11" />
              </div>
              <div className="flex items-center gap-2">
                <Thermometer size={14} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-[#737373] leading-none">Temperatura</p>
                  <p className="text-white font-bold text-sm">24,6°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain size={14} className="text-blue-400 shrink-0" />
                <div>
                  <p className="text-[#737373] leading-none">Chuva acumulada</p>
                  <p className="text-white font-bold text-sm">68 mm<span className="text-[10px] text-[#525252] font-normal"> • Últimos 7 dias</span></p>
                </div>
              </div>
            </div>

            <button className="text-xs font-semibold text-[#22c55e] mt-3 flex items-center hover:underline">
              Ver detalhes da fazenda <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>

          {/* Card: Alertas ativos */}
          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Alertas ativos</h2>
              <button className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center gap-0.5">
                Ver todos ({activeAlerts.length}) <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {activeAlerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-xl border flex items-start gap-3 ${alertStyles[alert.type]}`}>
                  <AlertTriangle size={15} className={`mt-0.5 shrink-0 ${alertIconColors[alert.type]}`} />
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{alert.title}</p>
                      <p className="text-xs text-[#737373] mt-0.5">{alert.loc}</p>
                    </div>
                    <span className="text-[11px] text-[#737373] font-mono shrink-0">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO INFERIOR: METEOROLOGIA + ATIVIDADES + ÍNDICES ── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {/* Card 1: Condições Meteorológicas */}
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col justify-between h-[280px]">
          <div>
            <h3 className="text-sm font-semibold text-white">Condições meteorológicas</h3>
            <div className="flex items-center gap-4 mt-4">
              <CloudSun size={36} className="text-amber-400" />
              <div>
                <p className="text-3xl font-black text-white leading-none">24°C</p>
                <p className="text-xs text-[#737373] mt-1">Parcialmente nublado</p>
              </div>
              <div className="ml-auto text-right text-xs text-[#737373] font-mono space-y-0.5">
                <p>Umidade: 65%</p>
                <p>Vento: 12 km/h NE</p>
                <p>Sensação: 25°C</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.03] pt-3">
            <p className="text-[10px] text-[#525252] mb-2 font-bold uppercase tracking-wider">Previsão para os próximos 5 dias</p>
            <div className="grid grid-cols-5 gap-1 text-center">
              {weatherForecast.map((w, i) => {
                const IconComponent = w.icon
                return (
                  <div key={i} className="p-1.5 rounded-lg">
                    <p className="text-xs font-semibold text-white">{w.day}</p>
                    <p className="text-[9px] text-[#525252] font-mono">{w.date}</p>
                    <div className="my-1.5 flex justify-center"><IconComponent size={16} className={w.iconColor} /></div>
                    <p className="text-xs font-bold text-white">{w.tempMax}°</p>
                    <p className="text-[10px] text-[#525252]">{w.tempMin}°</p>
                    <p className="text-[9px] text-blue-400 mt-0.5 font-mono">{w.rain} mm</p>
                  </div>
                )
              })}
            </div>
          </div>
          <button className="text-xs font-semibold text-[#22c55e] mt-2 flex items-center hover:underline transition">
            Ver previsão completa <ChevronRight size={14} className="ml-0.5" />
          </button>
        </div>

        {/* Card 2: Atividades Recentes */}
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Atividades recentes</h3>
              <button className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center">Ver todas <ChevronRight size={14} /></button>
            </div>
            <div className="space-y-3.5">
              {recentActivities.map((act, idx) => {
                const ActIcon = act.icon
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#161916] border border-white/[0.03] flex items-center justify-center shrink-0">
                      <ActIcon size={14} className={act.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{act.title}</p>
                      <p className="text-[11px] text-[#737373] mt-0.5">{act.desc}</p>
                    </div>
                    <span className="text-[10px] text-[#525252] font-mono shrink-0">{act.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Índices Gerais */}
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col h-[280px]">
          <h3 className="text-sm font-semibold text-white mb-1">Índices gerais</h3>

          <div className="flex-1 grid grid-cols-2 gap-3 items-center">
            {/* Gauge à esquerda — preenchimento proporcional ao índice */}
            <div className="flex items-center justify-center relative h-28">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <defs>
                  <linearGradient id="healthGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <path d="M20,100 A80,80 0 0,1 180,100" pathLength="100" fill="none" stroke="#1c1f1c" strokeWidth="16" strokeLinecap="round" />
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  pathLength="100"
                  fill="none"
                  stroke="url(#healthGaugeGradient)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${healthIndex} ${100 - healthIndex}`}
                />
              </svg>
              <div className="absolute bottom-0 text-center">
                <p className="text-2xl font-black text-white leading-none">{healthIndex}<span className="text-[10px] text-[#525252] font-normal">/100</span></p>
                <p className="text-[10px] text-[#737373] font-semibold mt-1">Índice médio de saúde</p>
                <p className="text-[9px] text-[#22c55e] font-mono mt-0.5">↗ +5 pontos vs. anterior</p>
              </div>
            </div>

            {/* Lista à direita */}
            <div className="space-y-3">
              <IndexRow icon={Tractor} color="#f97316" bg="rgba(249,115,22,0.15)" label="Produtividade" value={74} />
              <IndexRow icon={Leaf} color="#22c55e" bg="rgba(34,197,94,0.15)" label="Sustentabilidade" value={88} />
              <IndexRow icon={Droplet} color="#38bdf8" bg="rgba(56,189,248,0.15)" label="Eficiência hídrica" value={76} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}