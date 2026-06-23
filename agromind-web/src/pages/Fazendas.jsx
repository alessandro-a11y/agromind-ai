import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { LineChart, Line } from 'recharts'
import 'leaflet/dist/leaflet.css'
import { Home, Search, SlidersHorizontal, Plus, MapPin, Leaf, TriangleAlert, MoreVertical } from 'lucide-react'

const fazendas = [
  { id:1, nome:'Fazenda Santa Clara',   sub:'Talhão 12',        loc:'Região Sul, Paraná',      cult:'Soja',   safra:'Safra 2025/26', area:1250, saude:82, status:'Ativa',   cor:'#4a7c59', upd:'Hoje, 08:45',   lat:-24.038, lng:-52.373, spark:[70,72,75,78,79,80,81,82] },
  { id:2, nome:'Fazenda Boa Vista',     sub:'Talhões 5, 6 e 7', loc:'Região Oeste, Paraná',    cult:'Milho',  safra:'Safra 2025/26', area:980,  saude:76, status:'Ativa',   cor:'#4a7c59', upd:'Hoje, 07:30',   lat:-24.10,  lng:-52.50, spark:[68,70,71,73,74,75,75,76] },
  { id:3, nome:'Fazenda São Miguel',    sub:'Talhão 3',         loc:'Norte Pioneiro, PR',      cult:'Soja',   safra:'Safra 2025/26', area:630,  saude:68, status:'Ativa',   cor:'#4a7c59', upd:'Ontem, 16:10',  lat:-23.90,  lng:-52.20, spark:[60,62,64,64,65,66,67,68] },
  { id:4, nome:'Fazenda Esperança',     sub:'Talhões 1, 2 e 4', loc:'Centro-Sul, Paraná',      cult:'Trigo',  safra:'Safra 2025',    area:720,  saude:90, status:'Ativa',   cor:'#4a7c59', upd:'Ontem, 14:20',  lat:-25.10,  lng:-51.80, spark:[82,84,85,87,88,89,90,90] },
  { id:5, nome:'Fazenda Horizonté',     sub:'Talhão 8',         loc:'Sudoeste, Paraná',        cult:'Feijão', safra:'Safra 2024/25', area:450,  saude:54, status:'Atenção', cor:'#c9933a', upd:'22/06/2026',    lat:-25.50,  lng:-53.00, spark:[58,57,56,55,55,54,54,54] },
  { id:6, nome:'Fazenda Nova Aliança',  sub:'Talhões 9 e 10',   loc:'Noroeste, Paraná',        cult:'Soja',   safra:'Safra 2024/25', area:680,  saude:46, status:'Alerta',  cor:'#c0392b', upd:'20/06/2026',    lat:-23.50,  lng:-53.20, spark:[60,58,55,52,50,48,47,46] },
  { id:7, nome:'Fazenda ITA',           sub:'Talhão 11',        loc:'Oeste, Paraná',           cult:'Milho',  safra:'Safra 2025/26', area:140,  saude:88, status:'Ativa',   cor:'#4a7c59', upd:'19/06/2026',    lat:-24.50,  lng:-53.50, spark:[80,82,83,85,86,87,88,88] },
  { id:8, nome:'Fazenda Recanto Verde', sub:'Talhões 1 a 6',    loc:'Centro-Oeste, Paraná',    cult:'Soja',   safra:null,            area:0,    saude:null,status:'Inativa', cor:'#6b7f66', upd:null,            lat:-24.80,  lng:-52.80, spark:[] },
]

const culturasPie = [
  { name:'Soja',   value:2700, color:'#4a7c59' },
  { name:'Milho',  value:1260, color:'#c9933a' },
  { name:'Trigo',  value:720,  color:'#4a9fbf' },
  { name:'Feijão', value:170,  color:'#c0392b' },
]

const statusColor = {
  'Ativa':   { bg:'#2d4f3a', color:'#6aab7a' },
  'Atenção': { bg:'#4f3d1a', color:'#e8b05a' },
  'Alerta':  { bg:'#4f1a1a', color:'#f87171' },
  'Inativa': { bg:'#2a2a2a', color:'#6b7f66' },
}

const markerColor = {
  'Ativa':   '#4a7c59',
  'Atenção': '#c9933a',
  'Alerta':  '#c0392b',
  'Inativa': '#6b7f66',
}

function saudeColor(v) {
  if (!v) return 'var(--color-brand-muted)'
  return v>=75?'#6aab7a':v>=50?'#c9933a':'#f87171'
}

function MiniLine({ data, color }) {
  if (!data?.length) return <span style={{ color:'var(--color-brand-muted)', fontSize:12 }}>—</span>
  const pts = data.map((v,i) => ({ v }))
  return (
    <ResponsiveContainer width={80} height={28}>
      <LineChart data={pts}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  )
}

function KpiCard({ icon: Icon, iconBg, label, value, sub }) {
  return (
    <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                  borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div>
        <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:'0 0 4px' }}>{label}</p>
        <p style={{ fontSize:28, fontWeight:700, color:'var(--color-brand-text)', margin:'0 0 4px', lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:0 }}>{sub}</p>
      </div>
      <div style={{ width:48, height:48, borderRadius:12, background:iconBg,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={22} style={{ color:'#fff' }}/>
      </div>
    </div>
  )
}

const tabs = ['Todas as fazendas','Fazendas ativas','Fazendas inativas']

export default function Fazendas() {
  const [tab, setTab] = useState(0)
  const [busca, setBusca] = useState('')

  const filtered = fazendas.filter(f => {
    const matchBusca = f.nome.toLowerCase().includes(busca.toLowerCase())
    if (tab === 1) return matchBusca && f.status === 'Ativa'
    if (tab === 2) return matchBusca && f.status === 'Inativa'
    return matchBusca
  })

  return (
    <div className="dashboard-scroll" style={{ display:'flex', flexDirection:'column', gap:16, padding:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:'#2d4f3a',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Home size={20} style={{ color:'#6aab7a' }}/>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>Fazendas</h1>
            <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>
              Gerencie suas propriedades e acompanhe o desempenho de cada uma delas.
            </p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:8,
                        background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)' }}>
            <Search size={14} style={{ color:'var(--color-brand-muted)' }}/>
            <input value={busca} onChange={e=>setBusca(e.target.value)}
                   placeholder="Buscar fazenda..."
                   style={{ background:'transparent', border:'none', outline:'none', fontSize:13,
                            color:'var(--color-brand-text)', width:160 }}/>
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8,
                           background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                           color:'var(--color-brand-text)', fontSize:13, cursor:'pointer' }}>
            <SlidersHorizontal size={14}/> Filtros
          </button>
          <button style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8,
                           background:'var(--color-brand-green)', border:'none',
                           color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Plus size={15}/> Nova fazenda
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
        <KpiCard icon={Home}         iconBg="#2d4f3a" label="Total de fazendas"      value="8"      sub="propriedades cadastradas"/>
        <KpiCard icon={Leaf}         iconBg="#1e3a5f" label="Área total monitorada"  value="4.850 ha" sub="área consolidada"/>
        <KpiCard icon={Leaf}         iconBg="#2d4f3a" label="Fazendas ativas"        value="7"      sub="em monitoramento"/>
        <KpiCard icon={TriangleAlert}iconBg="#5a2d1e" label="Alertas ativos"         value="3"      sub="requerem atenção"/>
        <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                      borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:'0 0 4px' }}>Índice médio de saúde</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
              <span style={{ fontSize:28, fontWeight:700, color:'var(--color-brand-text)' }}>82</span>
              <span style={{ fontSize:14, color:'var(--color-brand-muted)' }}>/100</span>
            </div>
            <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:0 }}>das áreas monitoradas</p>
          </div>
          <svg viewBox="0 0 44 44" style={{ width:44, height:44 }}>
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-brand-border)" strokeWidth="4"/>
            <circle cx="22" cy="22" r="18" fill="none" stroke="#4a7c59" strokeWidth="4"
                    strokeDasharray={`${2*Math.PI*18*0.82} ${2*Math.PI*18}`}
                    strokeDashoffset={2*Math.PI*18*0.25} strokeLinecap="round" transform="rotate(-90 22 22)"/>
          </svg>
        </div>
      </div>

      {/* Tabs + conteúdo */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, alignItems:'start' }}>

        {/* Tabela */}
        <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)', borderRadius:12, overflow:'hidden' }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--color-brand-border)' }}>
            {tabs.map((t,i) => (
              <button key={t} onClick={()=>setTab(i)}
                      style={{ padding:'12px 20px', fontSize:13, fontWeight: tab===i?600:400, cursor:'pointer',
                               background:'transparent', border:'none',
                               color: tab===i?'var(--color-brand-text)':'var(--color-brand-muted)',
                               borderBottom: tab===i?'2px solid var(--color-brand-green-light)':'2px solid transparent' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Cabeçalho tabela */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 80px 120px 120px 140px 90px 32px',
                        padding:'10px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
            {['Fazenda','Localização','Área (ha)','Índice de saúde','Cultura principal','Última atualização','Status',''].map(h => (
              <span key={h} style={{ fontSize:11, color:'var(--color-brand-muted)', fontWeight:500 }}>{h}</span>
            ))}
          </div>

          {/* Linhas */}
          {filtered.map((f,i) => (
            <div key={f.id}
                 style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 80px 120px 120px 140px 90px 32px',
                          padding:'12px 16px', alignItems:'center',
                          borderBottom: i<filtered.length-1?'1px solid var(--color-brand-border)':'none',
                          transition:'background .15s' }}
                 onMouseEnter={e=>e.currentTarget.style.background='rgba(74,124,89,0.06)'}
                 onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

              {/* Fazenda */}
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:40, height:34, borderRadius:6, overflow:'hidden', flexShrink:0,
                              background:'#2d4f3a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Leaf size={16} style={{ color:'#6aab7a' }}/>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>{f.nome}</p>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:0 }}>{f.sub}</p>
                </div>
              </div>

              {/* Localização */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:4 }}>
                <MapPin size={11} style={{ color:'var(--color-brand-muted)', marginTop:2, flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:12, color:'var(--color-brand-text)', margin:0 }}>{f.loc}</p>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:0 }}>{f.cult}</p>
                </div>
              </div>

              {/* Área */}
              <span style={{ fontSize:13, color:'var(--color-brand-text)' }}>
                {f.area ? `${f.area.toLocaleString('pt-BR')} ha` : '0 ha'}
              </span>

              {/* Índice de saúde */}
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {f.saude ? (
                  <>
                    <Leaf size={13} style={{ color:saudeColor(f.saude) }}/>
                    <span style={{ fontSize:13, fontWeight:600, color:saudeColor(f.saude) }}>{f.saude}</span>
                    <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>/100</span>
                    <MiniLine data={f.spark} color={saudeColor(f.saude)}/>
                  </>
                ) : <span style={{ color:'var(--color-brand-muted)', fontSize:12 }}>—</span>}
              </div>

              {/* Cultura */}
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <Leaf size={13} style={{ color:'var(--color-brand-green-light)' }}/>
                <div>
                  <p style={{ fontSize:13, color:'var(--color-brand-text)', margin:0 }}>{f.cult}</p>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:0 }}>{f.safra ?? '—'}</p>
                </div>
              </div>

              {/* Última atualização */}
              <span style={{ fontSize:12, color:'var(--color-brand-muted)' }}>{f.upd ?? '—'}</span>

              {/* Status */}
              <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                             background:statusColor[f.status].bg, color:statusColor[f.status].color }}>
                {f.status}
              </span>

              {/* Menu */}
              <button style={{ background:'none', border:'none', cursor:'pointer', padding:4,
                               color:'var(--color-brand-muted)' }}>
                <MoreVertical size={15}/>
              </button>
            </div>
          ))}
        </div>

        {/* Coluna direita */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Mapa */}
          <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>Mapa das fazendas</span>
            </div>
            <div style={{ height:220 }}>
              <MapContainer center={[-24.3,-52.6]} zoom={6}
                            style={{ height:'100%', width:'100%' }} zoomControl={true}>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri, Maxar"
                />
                {fazendas.filter(f=>f.status!=='Inativa').map(f => (
                  <CircleMarker key={f.id} center={[f.lat, f.lng]} radius={8}
                                pathOptions={{ color:'#fff', weight:1.5, fillColor:markerColor[f.status], fillOpacity:1 }}>
                    <Popup>{f.nome} — {f.status}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            {/* Legenda */}
            <div style={{ padding:'10px 16px', display:'flex', gap:16, flexWrap:'wrap' }}>
              {[['#4a7c59','Ativa','5 fazendas'],['#c9933a','Atenção','1 fazenda'],['#c0392b','Alerta','1 fazenda'],['#6b7f66','Inativa','1 fazenda']].map(([c,l,s]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}/>
                  <span style={{ fontSize:11, color:'var(--color-brand-text)' }}>{l}</span>
                  <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo por cultura */}
          <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>Resumo por cultura</span>
            </div>
            <div style={{ padding:16, display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ position:'relative', width:110, height:110, flexShrink:0 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={culturasPie} cx={50} cy={50} innerRadius={34} outerRadius={50}
                         dataKey="value" stroke="none">
                      {culturasPie.map((c,i) => <Cell key={i} fill={c.color}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                              alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:15, fontWeight:700, color:'var(--color-brand-text)' }}>4.850</span>
                  <span style={{ fontSize:10, color:'var(--color-brand-muted)' }}>ha</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1 }}>
                {culturasPie.map(c => (
                  <div key={c.name} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }}/>
                    <span style={{ fontSize:12, color:'var(--color-brand-muted)', flex:1 }}>{c.name}</span>
                    <span style={{ fontSize:12, color:'var(--color-brand-text)', fontFamily:'var(--font-mono)' }}>
                      {c.value.toLocaleString('pt-BR')} ha ({Math.round(c.value/4850*100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
