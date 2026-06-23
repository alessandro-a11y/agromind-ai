import { useState } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import 'leaflet/dist/leaflet.css'
import {
  Bell, TriangleAlert, Droplets, CloudRain, Leaf, RefreshCw,
  ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight, ArrowRight
} from 'lucide-react'

const kpis = [
  { label:'Alertas ativos',   value:3,  sub:'requerem atenção',    icon:TriangleAlert, iconColor:'#c0392b', bg:'rgba(192,57,43,0.15)'  },
  { label:'Atenção',          value:5,  sub:'monitore de perto',   icon:TriangleAlert, iconColor:'#c9933a', bg:'rgba(201,147,58,0.15)' },
  { label:'Resolvidos (7 dias)',value:12,sub:'alertas encerrados',  icon:Leaf,          iconColor:'#6aab7a', bg:'rgba(74,124,89,0.15)'  },
  { label:'Total (7 dias)',   value:20, sub:'alertas registrados', icon:Bell,          iconColor:'#6b7f66', bg:'rgba(107,127,102,0.12)'},
]

const alertas = [
  { id:1, titulo:'Baixa umidade do solo',      desc:'Umidade do solo abaixo do ideal para Soja no Talhão 12.',
    fazenda:'Fazenda Santa Clara', talhao:'Talhão 12 • Soja',  tipo:'Umidade do solo', tipoIcon:Droplets,
    sev:'Alta',     sevColor:'#c0392b', sevBg:'rgba(192,57,43,0.2)',
    detectado:'Hoje, 08:45\n23/06/2026', status:'Ativo',    statusColor:'#6aab7a', statusBg:'rgba(74,124,89,0.2)',
    iconColor:'#c0392b' },
  { id:2, titulo:'Risco de praga (Lagarta)',   desc:'Condições favoráveis ao aumento de população de lagartas.',
    fazenda:'Fazenda Boa Vista',   talhao:'Talhão 7 • Milho',  tipo:'Pragas',         tipoIcon:TriangleAlert,
    sev:'Média',    sevColor:'#c9933a', sevBg:'rgba(201,147,58,0.2)',
    detectado:'Hoje, 07:30\n23/06/2026', status:'Ativo',    statusColor:'#6aab7a', statusBg:'rgba(74,124,89,0.2)',
    iconColor:'#c9933a' },
  { id:3, titulo:'Previsão de chuva intensa',  desc:'Previsão de acumulado acima de 60 mm nas próximas 24h.',
    fazenda:'Fazenda São Miguel',  talhao:'Talhão 3 • Soja',   tipo:'Clima',          tipoIcon:CloudRain,
    sev:'Média',    sevColor:'#c9933a', sevBg:'rgba(201,147,58,0.2)',
    detectado:'Ontem, 16:10\n22/06/2026', status:'Ativo',   statusColor:'#6aab7a', statusBg:'rgba(74,124,89,0.2)',
    iconColor:'#c9933a' },
  { id:4, titulo:'Índice de saúde abaixo da média', desc:'Índice de saúde abaixo da média no Talhão 5.',
    fazenda:'Fazenda Santa Clara', talhao:'Talhão 5 • Milho',  tipo:'Saúde da lavoura',tipoIcon:Leaf,
    sev:'Baixa',    sevColor:'#6aab7a', sevBg:'rgba(74,124,89,0.2)',
    detectado:'Ontem, 14:20\n22/06/2026', status:'Resolvido',statusColor:'#6b7f66', statusBg:'rgba(107,127,102,0.15)',
    iconColor:'#6aab7a' },
  { id:5, titulo:'Excesso de irrigação detectado',  desc:'Volume de irrigação acima do recomendado no Talhão 3.',
    fazenda:'Fazenda Horizonté',   talhao:'Talhão 3 • Soja',   tipo:'Irrigação',       tipoIcon:Droplets,
    sev:'Baixa',    sevColor:'#6aab7a', sevBg:'rgba(74,124,89,0.2)',
    detectado:'20/06/2026, 09:15\n20/06/2026', status:'Resolvido',statusColor:'#6b7f66', statusBg:'rgba(107,127,102,0.15)',
    iconColor:'#6aab7a' },
]

const pieData = [
  { name:'Clima',          value:6,  color:'#4a9fbf' },
  { name:'Umidade do solo',value:5,  color:'#c0392b' },
  { name:'Pragas',         value:4,  color:'#c9933a' },
  { name:'Saúde da lavoura',value:3, color:'#6aab7a' },
  { name:'Irrigação',      value:2,  color:'#4a7c59' },
]

const talhoesMapa = [
  { saude:32, cor:'#c0392b', fill:'#c0392b55',
    coords:[[-24.010,-52.380],[-23.995,-52.358],[-24.008,-52.342],[-24.023,-52.364]], label:'⚠' },
  { saude:61, cor:'#c9933a', fill:'#c9933a55',
    coords:[[-24.052,-52.358],[-24.035,-52.336],[-24.048,-52.320],[-24.065,-52.342]], label:'⚠' },
  { saude:78, cor:'#4a7c59', fill:'#4a7c5955',
    coords:[[-23.998,-52.400],[-23.980,-52.378],[-23.993,-52.362],[-24.011,-52.384]], label:'✓' },
  { saude:90, cor:'#4a7c59', fill:'#4a7c5955',
    coords:[[-24.068,-52.375],[-24.050,-52.353],[-24.063,-52.337],[-24.081,-52.359]], label:'✓' },
]

const recomendacoes = [
  { icon:Droplets,     titulo:'Verifique a umidade do solo',   desc:'Considere irrigação nas áreas com baixa umidade.'             },
  { icon:TriangleAlert,titulo:'Monitore pragas',               desc:'Aumente a frequência de monitoramento nas áreas de risco.'     },
  { icon:CloudRain,    titulo:'Prepare-se para chuva',         desc:'Verifique drenagem e evite aplicação de defensivos.'           },
  { icon:Leaf,         titulo:'Atenção à lavoura',             desc:'Avalie as áreas com índice de saúde abaixo da média.'         },
  { icon:Bell,         titulo:'Configurar alertas',            desc:'Personalize os tipos de alertas e receba notificações.', action:'Configurar alertas' },
]

const tabs = ['Todos','Ativos','Atenção','Resolvidos']

function Select({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', borderRadius:8,
                  background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                  fontSize:13, color:'var(--color-brand-text)', cursor:'pointer' }}>
      {label} <ChevronDown size={13} style={{ color:'var(--color-brand-muted)' }}/>
    </div>
  )
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                  borderRadius:12, ...style }}>
      {children}
    </div>
  )
}

export default function Alertas() {
  const [tab, setTab] = useState(0)

  const filtered = alertas.filter(a => {
    if (tab === 1) return a.status === 'Ativo'
    if (tab === 2) return a.sev === 'Média'
    if (tab === 3) return a.status === 'Resolvido'
    return true
  })

  return (
    <div className="dashboard-scroll" style={{ display:'flex', flexDirection:'column', gap:14, padding:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:'rgba(201,147,58,0.15)',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Bell size={20} style={{ color:'#c9933a' }}/>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>Alertas</h1>
            <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>
              Monitore e gerencie os alertas que exigem sua atenção nas fazendas.
            </p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Select label="Todas as fazendas"/>
          <Select label="Todos os tipos"/>
          <Select label="23/06/2026 – 29/06/2026"/>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--color-brand-muted)' }}>
            <RefreshCw size={13}/> Atualizado há 8 min
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {kpis.map(k => (
          <Card key={k.label} style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:'0 0 4px' }}>{k.label}</p>
              <p style={{ fontSize:32, fontWeight:700, color:'var(--color-brand-text)', margin:'0 0 4px', lineHeight:1 }}>{k.value}</p>
              <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:0 }}>{k.sub}</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:12, background:k.bg,
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
              <k.icon size={22} style={{ color:k.iconColor }}/>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabela + coluna direita */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:12 }}>

        {/* Tabela */}
        <Card style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
            <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 10px' }}>Lista de alertas</p>
            <div style={{ display:'flex', gap:0 }}>
              {tabs.map((t,i) => (
                <button key={t} onClick={()=>setTab(i)}
                        style={{ padding:'6px 14px', fontSize:13, cursor:'pointer', background:'transparent', border:'none',
                                 color: tab===i?'var(--color-brand-text)':'var(--color-brand-muted)',
                                 fontWeight: tab===i?600:400,
                                 borderBottom: tab===i?'2px solid var(--color-brand-green-light)':'2px solid transparent' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Header tabela */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1.2fr 1fr 28px',
                        padding:'8px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
            {['Alerta','Fazenda / Talhão','Tipo','Severidade','Detectado em','Status',''].map(h => (
              <span key={h} style={{ fontSize:11, color:'var(--color-brand-muted)', fontWeight:500 }}>{h}</span>
            ))}
          </div>

          {/* Linhas */}
          {filtered.map((a,i) => (
            <div key={a.id}
                 style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1.2fr 1fr 28px',
                          padding:'12px 16px', alignItems:'center',
                          borderBottom: i<filtered.length-1?'1px solid var(--color-brand-border)':'none',
                          transition:'background .15s' }}
                 onMouseEnter={e=>e.currentTarget.style.background='rgba(74,124,89,0.05)'}
                 onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <TriangleAlert size={16} style={{ color:a.iconColor, flexShrink:0, marginTop:2 }}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>{a.titulo}</p>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0', lineHeight:1.4 }}>{a.desc}</p>
                </div>
              </div>

              <div>
                <p style={{ fontSize:13, fontWeight:500, color:'var(--color-brand-text)', margin:0 }}>{a.fazenda}</p>
                <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>{a.talhao}</p>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <a.tipoIcon size={13} style={{ color:'var(--color-brand-muted)' }}/>
                <span style={{ fontSize:12, color:'var(--color-brand-text)' }}>{a.tipo}</span>
              </div>

              <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                             background:a.sevBg, color:a.sevColor, width:'fit-content' }}>
                {a.sev}
              </span>

              <div>
                {a.detectado.split('\n').map((l,i) => (
                  <p key={i} style={{ fontSize:11, color: i===0?'var(--color-brand-text)':'var(--color-brand-muted)', margin:0 }}>{l}</p>
                ))}
              </div>

              <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                             background:a.statusBg, color:a.statusColor, width:'fit-content' }}>
                {a.status}
              </span>

              <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-brand-muted)' }}>
                <MoreHorizontal size={15}/>
              </button>
            </div>
          ))}

          {/* Footer paginação */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'10px 16px', borderTop:'1px solid var(--color-brand-border)', marginTop:'auto' }}>
            <span style={{ fontSize:12, color:'var(--color-brand-muted)' }}>Mostrando 1-5 de 20 alertas</span>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <button style={{ width:28, height:28, borderRadius:6, background:'var(--color-brand-bg)',
                               border:'1px solid var(--color-brand-border)', cursor:'pointer',
                               display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-brand-muted)' }}>
                <ChevronLeft size={13}/>
              </button>
              {[1,2,3,4].map(n => (
                <button key={n} style={{ width:28, height:28, borderRadius:6, cursor:'pointer', fontSize:12,
                                         border: n===1?'1px solid var(--color-brand-green)':'1px solid var(--color-brand-border)',
                                         background: n===1?'var(--color-brand-green)':'var(--color-brand-bg)',
                                         color: n===1?'#fff':'var(--color-brand-muted)' }}>
                  {n}
                </button>
              ))}
              <button style={{ width:28, height:28, borderRadius:6, background:'var(--color-brand-bg)',
                               border:'1px solid var(--color-brand-border)', cursor:'pointer',
                               display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-brand-muted)' }}>
                <ChevronRight size={13}/>
              </button>
            </div>
          </div>
        </Card>

        {/* Coluna direita */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Mapa */}
          <Card style={{ overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)',
                          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>Distribuição dos alertas no mapa</span>
              <div style={{ display:'flex', gap:10, fontSize:11, color:'var(--color-brand-muted)' }}>
                {[['#c0392b','Alta'],['#c9933a','Média'],['#6aab7a','Baixa']].map(([c,l])=>(
                  <span key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ height:200 }}>
              <MapContainer center={[-24.038,-52.373]} zoom={12}
                            style={{ height:'100%', width:'100%' }} zoomControl={true}>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri"
                />
                {talhoesMapa.map((t,i) => (
                  <Polygon key={i} positions={t.coords}
                           pathOptions={{ color:t.cor, fillColor:t.fill, weight:2, fillOpacity:0.6 }}>
                    <Tooltip permanent direction="center" className="leaflet-tooltip-clean">
                      <span style={{ background:'rgba(15,20,16,0.85)', color:t.cor,
                                     border:`1px solid ${t.cor}`, borderRadius:6,
                                     padding:'2px 7px', fontSize:11, fontWeight:700 }}>
                        {t.label}
                      </span>
                    </Tooltip>
                  </Polygon>
                ))}
              </MapContainer>
            </div>
          </Card>

          {/* Alertas por tipo */}
          <Card style={{ padding:16 }}>
            <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 14px' }}>Alertas por tipo</p>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ position:'relative', width:90, height:90, flexShrink:0 }}>
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={pieData} cx={40} cy={40} innerRadius={28} outerRadius:={42}
                         dataKey="value" stroke="none">
                      {pieData.map((c,i) => <Cell key={i} fill={c.color}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                              alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:16, fontWeight:700, color:'var(--color-brand-text)' }}>20</span>
                  <span style={{ fontSize:9, color:'var(--color-brand-muted)' }}>Total</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:7, flex:1 }}>
                {pieData.map(p => (
                  <div key={p.name} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ width:7, height:7, borderRadius:2, background:p.color, flexShrink:0 }}/>
                    <span style={{ fontSize:12, color:'var(--color-brand-muted)', flex:1 }}>{p.name}</span>
                    <span style={{ fontSize:12, color:'var(--color-brand-text)', fontFamily:'var(--font-mono)' }}>
                      {p.value} ({Math.round(p.value/20*100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recomendações rápidas */}
      <Card>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)',
                      display:'flex', alignItems:'center', gap:8 }}>
          <Leaf size={15} style={{ color:'var(--color-brand-green-light)' }}/>
          <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>Recomendações rápidas</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:0 }}>
          {recomendacoes.map((r,i) => (
            <div key={r.titulo}
                 style={{ padding:16, borderRight: i<4?'1px solid var(--color-brand-border)':'none' }}>
              <div style={{ width:34, height:34, borderRadius:8, background:'#2d4f3a',
                            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                <r.icon size={15} style={{ color:'#6aab7a' }}/>
              </div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 5px' }}>{r.titulo}</p>
              <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:'0 0 10px', lineHeight:1.5 }}>{r.desc}</p>
              <button style={{ fontSize:12, color:'var(--color-brand-green-light)', background:'none',
                               border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
                {r.action ?? 'Ver recomendação'} <ArrowRight size={11}/>
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
