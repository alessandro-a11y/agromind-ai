import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts'
import 'leaflet/dist/leaflet.css'
import {
  CloudSun, Wind, Droplets, Thermometer, Sun, Leaf,
  TriangleAlert, ArrowRight, Download, RefreshCw, ChevronDown, Bell
} from 'lucide-react'

const previsao7 = [
  { dia:'Ter', data:'24/06', icon:'⛅', desc:'Parcialmente nublado', max:28, min:16, chuva:10, vento:12, dir:'NE' },
  { dia:'Qua', data:'25/06', icon:'🌧', desc:'Chuva fraca',          max:25, min:17, chuva:80, vento:14, dir:'NE' },
  { dia:'Qui', data:'26/06', icon:'☀️', desc:'Ensolarado',           max:27, min:18, chuva:0,  vento:10, dir:'E'  },
  { dia:'Sex', data:'27/06', icon:'🌦', desc:'Pancadas de chuva',    max:24, min:17, chuva:0,  vento:10, dir:'E'  },
  { dia:'Sáb', data:'28/06', icon:'🌧', desc:'Chuva moderada',       max:24, min:13, chuva:90, vento:15, dir:'S'  },
  { dia:'Dom', data:'29/06', icon:'⛅', desc:'Parcialmente nublado', max:23, min:15, chuva:20, vento:15, dir:'SE' },
  { dia:'Seg', data:'30/06', icon:'☀️', desc:'Ensolarado',           max:26, min:17, chuva:0,  vento:12, dir:'NE' },
]

const tempHora = [
  {h:'00h',max:20,min:17},{h:'04h',max:19,min:16},{h:'08h',max:22,min:18},
  {h:'12h',max:28,min:22},{h:'16h',max:26,min:20},{h:'20h',max:23,min:18},
]

const historico = [
  {d:'01/05',chuva:8, temp:21},{d:'05/05',chuva:22,temp:22},{d:'08/05',chuva:35,temp:20},
  {d:'12/05',chuva:5, temp:23},{d:'15/05',chuva:18,temp:22},{d:'19/05',chuva:0, temp:24},
  {d:'22/05',chuva:12,temp:23},{d:'26/05',chuva:28,temp:21},{d:'29/05',chuva:14,temp:22},
  {d:'31/05',chuva:0, temp:23},
]

const alertasClima = [
  { titulo:'Risco de chuva intensa',    sub:'Região Sul',   time:'Próximas 24h'  },
  { titulo:'Temperaturas acima da média',sub:'Região Oeste', time:'Próximos 3 dias'},
  { titulo:'Baixa umidade do ar',        sub:'Região Norte', time:'Próximos 2 dias'},
]

const recomendacoes = [
  { icon:Droplets,     titulo:'Manejo de irrigação',      desc:'Evapotranspiração alta prevista para os próximos dias.' },
  { icon:Leaf,         titulo:'Aplicação de defensivos',  desc:'Janela favorável para aplicação nos próximos 2 dias.'   },
  { icon:CloudSun,     titulo:'Colheita',                 desc:'Condições favoráveis para colheita até sexta-feira.'    },
  { icon:Sun,          titulo:'Plantio',                  desc:'Aguarde melhora nas condições de umidade do solo.'      },
]

function Card({ children, style={} }) {
  return (
    <div style={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                  borderRadius:12, ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, sub, action, actionLabel }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
      <div>
        <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>{title}</p>
        {sub && <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>{sub}</p>}
      </div>
      {action && (
        <button onClick={action} style={{ display:'flex', alignItems:'center', gap:4, fontSize:12,
                color:'var(--color-brand-green-light)', background:'none', border:'none', cursor:'pointer' }}>
          {actionLabel} <ArrowRight size={12}/>
        </button>
      )}
    </div>
  )
}

function Select({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', borderRadius:8,
                  background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                  fontSize:13, color:'var(--color-brand-text)', cursor:'pointer' }}>
      {label} <ChevronDown size={13} style={{ color:'var(--color-brand-muted)' }}/>
    </div>
  )
}

export default function Clima() {
  return (
    <div className="dashboard-scroll" style={{ display:'flex', flexDirection:'column', gap:14, padding:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:'#1e3a5a',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CloudSun size={20} style={{ color:'#4a9fbf' }}/>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>Clima</h1>
            <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>
              Acompanhe as condições meteorológicas e previsões para suas fazendas.
            </p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Select label="Todas as fazendas"/>
          <Select label="23/06/2026 – 29/06/2026"/>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--color-brand-muted)' }}>
            <RefreshCw size={13}/> Atualizado há 8 min
          </div>
        </div>
      </div>

      {/* Row 1 — 4 cards condições */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1.2fr 1fr', gap:12 }}>

        {/* Condições atuais */}
        <Card style={{ padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>Condições atuais</p>
              <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>Fazenda Santa Clara • Talhão 12</p>
            </div>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11,
                           color:'#6aab7a', background:'#2d4f3a', padding:'3px 8px', borderRadius:20 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#6aab7a', display:'inline-block' }}/>
              Estação instalada
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
            <span style={{ fontSize:48 }}>⛅</span>
            <div>
              <p style={{ fontSize:36, fontWeight:300, color:'var(--color-brand-text)', margin:0 }}>24,6°C</p>
              <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>Parcialmente nublado</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { icon:Thermometer, color:'#c9933a', label:'Sensação térmica', val:'25°C'     },
              { icon:Wind,        color:'#4a9fbf', label:'Vento',            val:'12 km/h NE'},
              { icon:Droplets,    color:'#4a9fbf', label:'Umidade',          val:'65%'      },
            ].map(({ icon:Icon, color, label, val }) => (
              <div key={label}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2 }}>
                  <Icon size={12} style={{ color }}/>
                  <span style={{ fontSize:10, color:'var(--color-brand-muted)' }}>{label}</span>
                </div>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>{val}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Precipitação */}
        <Card style={{ padding:16 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 12px' }}>Precipitação</p>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ fontSize:32 }}>🌧</span>
            <div>
              <p style={{ fontSize:28, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>68 mm</p>
              <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:0 }}>Últimos 7 dias</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ padding:'8px 10px', borderRadius:8, background:'var(--color-brand-bg)',
                          border:'1px solid var(--color-brand-border)' }}>
              <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'0 0 4px' }}>Probabilidade de chuva</p>
              <p style={{ fontSize:22, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>40%</p>
              <p style={{ fontSize:10, color:'var(--color-brand-muted)', margin:0 }}>Próximas 24h</p>
            </div>
            <div style={{ padding:'8px 10px', borderRadius:8, background:'var(--color-brand-bg)',
                          border:'1px solid var(--color-brand-border)' }}>
              <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'0 0 4px' }}>Previsão acumulada</p>
              <p style={{ fontSize:22, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>22 mm</p>
              <p style={{ fontSize:10, color:'var(--color-brand-muted)', margin:0 }}>Próximos 7 dias</p>
            </div>
          </div>
        </Card>

        {/* Temperatura */}
        <Card style={{ padding:16 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 10px' }}>Temperatura</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <Thermometer size={14} style={{ color:'#f87171' }}/>
                <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>Máxima</span>
              </div>
              <p style={{ fontSize:24, fontWeight:700, color:'#f87171', margin:0 }}>28,7°C</p>
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <Thermometer size={14} style={{ color:'#4a9fbf' }}/>
                <span style={{ fontSize:11, color:'var(--color-brand-muted)' }}>Mínima</span>
              </div>
              <p style={{ fontSize:24, fontWeight:700, color:'#4a9fbf', margin:0 }}>16,2°C</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={52}>
            <LineChart data={tempHora}>
              <Line type="monotone" dataKey="max" stroke="#f87171" strokeWidth={1.5} dot={false}/>
              <Line type="monotone" dataKey="min" stroke="#4a9fbf" strokeWidth={1.5} dot={false}/>
              <XAxis dataKey="h" tick={{ fontSize:9, fill:'var(--color-brand-muted)' }} axisLine={false} tickLine={false}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Outros índices */}
        <Card style={{ padding:16 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 14px' }}>Outros índices</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { icon:Sun,         color:'#e8b05a', label:'Radiação solar',        val:'650 W/m²' },
              { icon:Leaf,        color:'#6aab7a', label:'Evapotranspiração (ET₀)',val:'4,2 mm'   },
              { icon:Droplets,    color:'#4a9fbf', label:'Ponto de orvalho',       val:'17,1°C'   },
              { icon:Wind,        color:'#a0a0a0', label:'Pressão atmosférica',    val:'1015 hPa' },
            ].map(({ icon:Icon, color, label, val }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Icon size={14} style={{ color, flexShrink:0 }}/>
                <span style={{ fontSize:12, color:'var(--color-brand-muted)', flex:1 }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)',
                               fontFamily:'var(--font-mono)' }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2 — previsão 7 dias + mapa precip + coluna direita */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px 280px', gap:12 }}>

        {/* Previsão 7 dias */}
        <Card>
          <CardHeader title="Previsão do tempo" sub="Próximos 7 dias" action={()=>{}} actionLabel="Ver previsão detalhada"/>
          <div style={{ padding:16, overflowX:'auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, minWidth:560 }}>
              {previsao7.map(p => (
                <div key={p.dia} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                                          padding:'10px 6px', borderRadius:8, background:'var(--color-brand-bg)',
                                          border:'1px solid var(--color-brand-border)' }}>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--color-brand-text)' }}>{p.dia}</span>
                  <span style={{ fontSize:10, color:'var(--color-brand-muted)' }}>{p.data}</span>
                  <span style={{ fontSize:26 }}>{p.icon}</span>
                  <span style={{ fontSize:10, color:'var(--color-brand-muted)', textAlign:'center', lineHeight:1.3 }}>{p.desc}</span>
                  <span style={{ fontSize:16, fontWeight:700, color:'#f87171' }}>{p.max}°</span>
                  <span style={{ fontSize:13, color:'#4a9fbf' }}>{p.min}°</span>
                  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <Droplets size={10} style={{ color: p.chuva>50?'#4a9fbf':'var(--color-brand-muted)' }}/>
                    <span style={{ fontSize:10, color: p.chuva>50?'#4a9fbf':'var(--color-brand-muted)' }}>{p.chuva}%</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <Wind size={10} style={{ color:'var(--color-brand-muted)' }}/>
                    <span style={{ fontSize:10, color:'var(--color-brand-muted)' }}>{p.vento} km/h {p.dir}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Mapa precipitação */}
        <Card style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <CardHeader title="Mapa de precipitação" sub="Acumulado previsto para os próximos 7 dias" action={()=>{}} actionLabel="Ver mapa ampliado"/>
          <div style={{ flex:1, position:'relative', minHeight:200 }}>
            <MapContainer center={[-24.0,-51.5]} zoom={5}
                          style={{ height:200, width:'100%' }} zoomControl={true}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri"
              />
              {/* Camada de precipitação simulada via OpenWeatherMap tile (gratuito) */}
              <TileLayer
                url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=demo"
                opacity={0.6}
              />
            </MapContainer>
          </div>
          {/* Legenda gradiente */}
          <div style={{ padding:'10px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, color:'var(--color-brand-muted)' }}>
              <span>mm</span>
              <div style={{ flex:1, height:8, borderRadius:4,
                            background:'linear-gradient(to right,#4a9fbf,#6aab7a,#c9933a,#c0392b,#8b00ff)' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--color-brand-muted)', marginTop:3 }}>
              {['0','10','25','50','75','100','150+'].map(v=><span key={v}>{v}</span>)}
            </div>
          </div>
        </Card>

        {/* Coluna direita */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Alertas climáticos */}
          <Card>
            <CardHeader title="Alertas climáticos" action={()=>{}} actionLabel="Ver todos (3)"/>
            <div style={{ display:'flex', flexDirection:'column', gap:8, padding:12 }}>
              {alertasClima.map((a,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 10px',
                                      borderRadius:8, background:'rgba(201,147,58,0.10)',
                                      border:'1px solid rgba(201,147,58,0.25)' }}>
                  <TriangleAlert size={14} style={{ color:'#c9933a', flexShrink:0, marginTop:2 }}/>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:'var(--color-brand-text)', margin:0 }}>{a.titulo}</p>
                    <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>{a.sub}</p>
                  </div>
                  <span style={{ fontSize:10, color:'var(--color-brand-muted)', flexShrink:0, marginTop:2 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Histórico climático */}
          <Card style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>Histórico climático</p>
                <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>Maio/2026</p>
              </div>
              <button style={{ display:'flex', alignItems:'center', gap:4, fontSize:11,
                               color:'var(--color-brand-green-light)', background:'none', border:'none', cursor:'pointer' }}>
                <Download size={12}/> Baixar relatório
              </button>
            </div>
            <div style={{ padding:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'0 0 2px' }}>Chuva acumulada</p>
                  <p style={{ fontSize:20, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>142 mm</p>
                  <p style={{ fontSize:11, color:'#6aab7a', margin:0 }}>+18% vs. média histórica</p>
                </div>
                <div>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'0 0 2px' }}>Temperatura média</p>
                  <p style={{ fontSize:20, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>22,1°C</p>
                  <p style={{ fontSize:11, color:'#f87171', margin:0 }}>+1,2°C vs. média histórica</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:12, fontSize:11, marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:12, height:3, background:'#4a9fbf', borderRadius:2, display:'inline-block' }}/>
                  Chuva (mm)
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:12, height:3, background:'#f87171', borderRadius:2, display:'inline-block' }}/>
                  Temp. média (°C)
                </div>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <ComposedChart data={historico}>
                  <XAxis dataKey="d" tick={{ fontSize:8, fill:'var(--color-brand-muted)' }} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="l" hide/>
                  <YAxis yAxisId="r" orientation="right" hide/>
                  <Tooltip contentStyle={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)', fontSize:11 }}/>
                  <Bar yAxisId="l" dataKey="chuva" fill="#4a9fbf" opacity={0.7} radius={[2,2,0,0]}/>
                  <Line yAxisId="r" type="monotone" dataKey="temp" stroke="#f87171" strokeWidth={1.5} dot={false}/>
                </ComposedChart>
              </ResponsiveContainer>
              <button style={{ display:'flex', alignItems:'center', gap:4, fontSize:12,
                               color:'var(--color-brand-green-light)', background:'none', border:'none',
                               cursor:'pointer', marginTop:8 }}>
                Ver histórico completo <ArrowRight size={12}/>
              </button>
            </div>
          </Card>

          {/* Personalizar alertas */}
          <Card style={{ padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Bell size={18} style={{ color:'var(--color-brand-amber)' }}/>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>Personalizar alertas</p>
                <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>Configure alertas climáticos para suas fazendas.</p>
              </div>
            </div>
            <button style={{ fontSize:12, color:'var(--color-brand-green-light)', background:'none',
                             border:'none', cursor:'pointer', marginTop:10, padding:0 }}>
              Configurar →
            </button>
          </Card>
        </div>
      </div>

      {/* Row 3 — Recomendações */}
      <Card>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)',
                      display:'flex', alignItems:'center', gap:8 }}>
          <Leaf size={15} style={{ color:'var(--color-brand-green-light)' }}/>
          <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>Recomendações com base no clima</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
          {recomendacoes.map((r,i) => (
            <div key={r.titulo}
                 style={{ padding:16, borderRight: i<3 ? '1px solid var(--color-brand-border)' : 'none' }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'#2d4f3a',
                            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                <r.icon size={16} style={{ color:'#6aab7a' }}/>
              </div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 6px' }}>{r.titulo}</p>
              <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:'0 0 10px', lineHeight:1.5 }}>{r.desc}</p>
              <button style={{ fontSize:12, color:'var(--color-brand-green-light)', background:'none',
                               border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
                Ver recomendação <ArrowRight size={11}/>
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
