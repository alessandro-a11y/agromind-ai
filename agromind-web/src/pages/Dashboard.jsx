import { useAuth } from '../store/AuthContext'
import { MapContainer, TileLayer, Polygon, Tooltip, Popup } from 'react-leaflet'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { Leaf, Droplets, Thermometer, CloudRain, TriangleAlert, ArrowRight, Sprout, Tractor, Pipette } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const talhoes = [
  { id:1, nome:'Talhão 8',  cultura:'Soja',    area:'120 ha', saude:85,
    coords:[[-24.035,-52.385],[-24.015,-52.360],[-24.030,-52.345],[-24.050,-52.370]] },
  { id:2, nome:'Talhão 12', cultura:'Soja',    area:'45 ha',  saude:32,
    coords:[[-24.010,-52.380],[-23.995,-52.358],[-24.008,-52.342],[-24.023,-52.364]] },
  { id:3, nome:'Talhão 7',  cultura:'Milho',   area:'80 ha',  saude:61,
    coords:[[-24.052,-52.358],[-24.035,-52.336],[-24.048,-52.320],[-24.065,-52.342]] },
  { id:4, nome:'Talhão 3',  cultura:'Algodão', area:'60 ha',  saude:78,
    coords:[[-23.998,-52.400],[-23.980,-52.378],[-23.993,-52.362],[-24.011,-52.384]] },
  { id:5, nome:'Talhão 5',  cultura:'Milho',   area:'95 ha',  saude:90,
    coords:[[-24.068,-52.375],[-24.050,-52.353],[-24.063,-52.337],[-24.081,-52.359]] },
]

function saudeColor(v)     { return v>=75?'#4a7c59':v>=50?'#c9933a':'#c0392b' }
function saudeFillColor(v) { return v>=75?'#4a7c5966':v>=50?'#c9933a66':'#c0392b66' }

const sparkSaude = [74,76,77,78,79,80,81,81,82].map(v=>({v}))
const sparkUmid  = [68,67,66,66,65,65,65,65,65].map(v=>({v}))
const saudeData  = [60,65,68,72,74,76,78,80,82].map(v=>({v}))

const alertas = [
  { cor:'#c0392b', bg:'rgba(192,57,43,0.12)',  border:'rgba(192,57,43,0.3)',  titulo:'Baixa umidade do solo',     sub:'Talhão 12 • Soja',  time:'10 min atrás' },
  { cor:'#c9933a', bg:'rgba(201,147,58,0.10)', border:'rgba(201,147,58,0.25)',titulo:'Risco de praga (Lagarta)',  sub:'Talhão 7 • Milho',  time:'2 h atrás'    },
  { cor:'#c9933a', bg:'rgba(201,147,58,0.10)', border:'rgba(201,147,58,0.25)',titulo:'Previsão de chuva intensa', sub:'Região Sul',        time:'5 h atrás'    },
]

const atividades = [
  { icon:Leaf,     bg:'#2d4f3a', titulo:'Plantio concluído no Talhão 8',    sub:'Soja • 120 ha',    time:'Hoje, 08:45'  },
  { icon:Droplets, bg:'#1e3a5a', titulo:'Aplicação realizada no Talhão 12', sub:'Fungicida • 45 ha', time:'Hoje, 07:30'  },
  { icon:Tractor,  bg:'#3a3a1e', titulo:'Colheita iniciada no Talhão 5',    sub:'Milho • 80 ha',    time:'Ontem, 16:10' },
  { icon:Pipette,  bg:'#1e3a5a', titulo:'Irrigação programada no Talhão 3', sub:'Algodão • 60 ha',  time:'22/06/2026'   },
]

const previsao = [
  { dia:'Ter', data:'24/06', icon:'⛅', max:25, min:16, chuva:0  },
  { dia:'Qua', data:'25/06', icon:'🌧', max:23, min:17, chuva:8  },
  { dia:'Qui', data:'26/06', icon:'☀️', max:26, min:18, chuva:0  },
  { dia:'Sex', data:'27/06', icon:'🌤', max:24, min:17, chuva:0  },
  { dia:'Sáb', data:'28/06', icon:'🌧', max:22, min:16, chuva:15 },
]

function MiniSpark({ data, color }) {
  return (
    <ResponsiveContainer width={64} height={28}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
              fill={`url(#g${color.replace('#','')})`} dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)', borderRadius:12, ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, action, actionLabel }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
      <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>{title}</span>
      {action && (
        <button onClick={action} style={{ display:'flex', alignItems:'center', gap:4,
                fontSize:12, color:'var(--color-brand-green-light)', background:'none', border:'none', cursor:'pointer' }}>
          {actionLabel} <ArrowRight size={12}/>
        </button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="dashboard-scroll" style={{ display:"flex", flexDirection:"column", gap:16, padding:16 }}>

      {/* Row 1: mapa + painel direito */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:16 }}>

        {/* Mapa */}
        <Card style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <CardHeader title="Visão da operação" action={()=>{}} actionLabel="Ver todas as fazendas"/>
          <div style={{ position:"relative", height:400, overflow:"hidden" }}>
            <MapContainer center={[-24.038,-52.373]} zoom={13}
                          style={{ height:'100%', width:'100%' }} zoomControl={true}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri, Maxar, Earthstar Geographics"
              />
              {talhoes.map(t => (
                <Polygon key={t.id} positions={t.coords}
                         pathOptions={{ color:saudeColor(t.saude), fillColor:saudeFillColor(t.saude), weight:2, fillOpacity:0.55 }}>
                  <Tooltip permanent direction="center" className="leaflet-tooltip-clean">
                    <span style={{ background:'rgba(15,20,16,0.85)', color:saudeColor(t.saude),
                                   border:`1px solid ${saudeColor(t.saude)}`, borderRadius:6,
                                   padding:'2px 7px', fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>
                      {t.saude>=75?'🌿':t.saude>=50?'⚠️':'🔴'} {t.nome}
                    </span>
                  </Tooltip>
                  <Popup>
                    <div style={{ fontSize:13, minWidth:140 }}>
                      <strong>{t.nome}</strong><br/>
                      {t.cultura} • {t.area}<br/>
                      Saúde: <strong style={{ color:saudeColor(t.saude) }}>{t.saude}/100</strong>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
            {/* Legenda */}
            <div style={{ position:'absolute', bottom:16, left:16, zIndex:500,
                          background:'rgba(15,20,16,0.88)', border:'1px solid var(--color-brand-border)',
                          borderRadius:8, padding:'8px 12px' }}>
              <p style={{ fontSize:11, color:'var(--color-brand-muted)', marginBottom:6 }}>Índice de Saúde</p>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11 }}>
                <span style={{ color:'var(--color-brand-muted)' }}>0</span>
                <div style={{ width:120, height:8, borderRadius:4,
                              background:'linear-gradient(to right,#c0392b,#c9933a,#4a7c59)' }}/>
                <span style={{ color:'var(--color-brand-muted)' }}>100</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Coluna direita */}
        <div className="dashboard-scroll" style={{ display:"flex", flexDirection:"column", gap:16, padding:16 }}>

          {/* Fazenda Santa Clara */}
          <Card>
            <div style={{ padding:16 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>Fazenda Santa Clara</h2>
                  <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>Talhão 12 • Região Sul, Paraná</p>
                </div>
                <span style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px',
                               borderRadius:20, background:'#2d4f3a', color:'#6aab7a', fontSize:12, fontWeight:500 }}>
                  <Leaf size={11}/> Ativa
                </span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { icon:Leaf,        ic:'#6aab7a', label:'Índice de Saúde', value:'82', unit:'/100', spark:sparkSaude, sc:'#4a7c59' },
                  { icon:Droplets,    ic:'#4a9fbf', label:'Umidade do solo',  value:'65', unit:'%',   spark:sparkUmid,  sc:'#4a9fbf' },
                  { icon:Thermometer, ic:'#c9933a', label:'Temperatura',      value:'24,6', unit:'°C' },
                  { icon:CloudRain,   ic:'#4a9fbf', label:'Chuva acumulada',  value:'68',   unit:' mm', sub:'Últimos 7 dias' },
                ].map(({ icon:Icon, ic, label, value, unit, spark, sc, sub }) => (
                  <div key={label} style={{ background:'var(--color-brand-bg)', border:'1px solid var(--color-brand-border)',
                                            borderRadius:8, padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Icon size={12} style={{ color:ic }}/>
                        <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>{label}</span>
                      </div>
                      {spark && <MiniSpark data={spark} color={sc}/>}
                    </div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                      <Icon size={16} style={{ color:ic }}/>
                      <span style={{ fontSize:22, fontWeight:600, color:'var(--color-brand-text)' }}>{value}</span>
                      <span style={{ fontSize:13, color:'var(--color-brand-muted)' }}>{unit}</span>
                    </div>
                    {sub && <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>{sub}</p>}
                  </div>
                ))}
              </div>

              <button style={{ display:'flex', alignItems:'center', gap:6, marginTop:12,
                               fontSize:12, color:'var(--color-brand-green-light)', background:'none', border:'none', cursor:'pointer' }}>
                Ver detalhes da fazenda <ArrowRight size={12}/>
              </button>
            </div>
          </Card>

          {/* Alertas */}
          <Card style={{ flex:1 }}>
            <CardHeader title="Alertas ativos" action={()=>{}} actionLabel="Ver todos (3)"/>
            <div style={{ display:'flex', flexDirection:'column', gap:8, padding:12 }}>
              {alertas.map((a,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px',
                                      borderRadius:8, background:a.bg, border:`1px solid ${a.border}` }}>
                  <TriangleAlert size={14} style={{ color:a.cor, flexShrink:0, marginTop:2 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:'var(--color-brand-text)', margin:0 }}>{a.titulo}</p>
                    <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>{a.sub}</p>
                  </div>
                  <span style={{ fontSize:11, color:'var(--color-brand-muted)', flexShrink:0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: clima + atividades + índices */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>

        {/* Clima */}
        <Card>
          <CardHeader title="Condições meteorológicas" action={()=>{}} actionLabel="Ver previsão completa"/>
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:40 }}>⛅</span>
              <div>
                <p style={{ fontSize:32, fontWeight:300, color:'var(--color-brand-text)', margin:0 }}>24°C</p>
                <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>Parcialmente nublado</p>
                <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>Umidade: 65% • Vento: 12 km/h NE • Sensação: 25°C</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize:11, color:'var(--color-brand-muted)', marginBottom:10 }}>Previsão para os próximos 5 dias</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:4 }}>
                {previsao.map(p => (
                  <div key={p.dia} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:'var(--color-brand-text)' }}>{p.dia}</span>
                    <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>{p.data}</span>
                    <span style={{ fontSize:22 }}>{p.icon}</span>
                    <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>{p.max}°</span>
                    <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>{p.min}°</span>
                    {p.chuva>0
                      ? <span style={{ fontSize:11, color:'#4a9fbf' }}>● {p.chuva} mm</span>
                      : <span style={{ fontSize:11, color:'var(--color-brand-border)' }}>○ 0 mm</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Atividades */}
        <Card>
          <CardHeader title="Atividades recentes" action={()=>{}} actionLabel="Ver todas"/>
          <div>
            {atividades.map((a,i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px',
                                    borderBottom: i<atividades.length-1 ? '1px solid var(--color-brand-border)' : 'none' }}>
                <div style={{ width:28, height:28, borderRadius:8, background:a.bg,
                              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                  <a.icon size={13} style={{ color:'#fff' }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, color:'var(--color-brand-text)', margin:0 }}>{a.titulo}</p>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>{a.sub}</p>
                </div>
                <span style={{ fontSize:11, color:'var(--color-brand-muted)', flexShrink:0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Índices gerais */}
        <Card>
          <CardHeader title="Índices gerais"/>
          <div style={{ padding:16, display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ position:'relative', width:130, height:80, flexShrink:0 }}>
              <svg viewBox="0 0 140 85" style={{ width:'100%' }}>
                <path d="M12,72 A58,58 0 0,1 128,72" fill="none"
                      stroke="var(--color-brand-border)" strokeWidth="13" strokeLinecap="round"/>
                <path d="M12,72 A58,58 0 0,1 128,72" fill="none"
                      stroke="url(#gaugeGrad2)" strokeWidth="13" strokeLinecap="round"
                      strokeDasharray="182" strokeDashoffset={182*(1-0.82)}/>
                <defs>
                  <linearGradient id="gaugeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#4a7c59"/>
                    <stop offset="55%"  stopColor="#c9933a"/>
                    <stop offset="100%" stopColor="#c0392b"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                            alignItems:'center', justifyContent:'flex-end', paddingBottom:0 }}>
                <span style={{ fontSize:24, fontWeight:700, color:'var(--color-brand-text)' }}>82</span>
                <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>/100</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
              <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:0 }}>Índice médio de saúde</p>
              {[
                { icon:Tractor,  color:'#c9933a', label:'Produtividade',    value:'74/100' },
                { icon:Sprout,   color:'#4a7c59', label:'Sustentabilidade', value:'88/100' },
                { icon:Droplets, color:'#4a9fbf', label:'Eficiência hídrica',value:'76/100'},
              ].map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <s.icon size={13} style={{ color:s.color }}/>
                  <span style={{ fontSize:12, color:'var(--color-brand-muted)', flex:1 }}>{s.label}</span>
                  <span style={{ fontSize:12, fontFamily:'var(--font-mono)', fontWeight:500,
                                 color:'var(--color-brand-text)' }}>{s.value}</span>
                </div>
              ))}
              <p style={{ fontSize:12, color:'#6aab7a', margin:0 }}>↗ +5 pontos vs. período anterior</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
