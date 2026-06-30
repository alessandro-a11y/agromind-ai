import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip
} from 'recharts'
import 'leaflet/dist/leaflet.css'
import {
  ClipboardList, Leaf, Droplets, TriangleAlert, CloudRain,
  RefreshCw, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight, ArrowRight
} from 'lucide-react'

const kpis = [
  { label:'Saúde geral da lavoura', value:'87%', sub:'Boa',        subColor:'#6aab7a', trend:'+6% vs período anterior',  trendColor:'#6aab7a', icon:Leaf,        iconBg:'#2d4f3a', iconColor:'#6aab7a', spark:[78,80,81,82,83,84,86,87] },
  { label:'Risco de pragas',        value:'Médio',sub:'3 áreas em atenção', subColor:'#c9933a', trend:'↑ 2 áreas vs período anterior', trendColor:'#c9933a', icon:TriangleAlert,iconBg:'rgba(201,147,58,0.15)',iconColor:'#c9933a', spark:[40,42,44,45,47,48,50,50] },
  { label:'Umidade média do solo',  value:'64%', sub:'Dentro do ideal',subColor:'#4a9fbf', trend:'+4% vs período anterior', trendColor:'#6aab7a', icon:Droplets,    iconBg:'#1e3a5a', iconColor:'#4a9fbf', spark:[58,60,61,62,63,63,64,64] },
  { label:'Eficiência da irrigação',value:'91%', sub:'Excelente',  subColor:'#6aab7a', trend:'+7% vs período anterior',  trendColor:'#6aab7a', icon:CloudRain,   iconBg:'#1a3a3a', iconColor:'#4a9fbf', spark:[80,82,84,86,87,89,90,91] },
]

const diagnosticos = [
  { id:1, titulo:'Estresse hídrico detectado', desc:'Déficit de água acima do ideal no Talhão 12.',
    fazenda:'Fazenda Santa Clara', talhao:'Talhão 12 • Soja', cat:'Irrigação', catIcon:Droplets,
    sev:'Alta',  sevColor:'#c0392b', sevBg:'rgba(192,57,43,0.2)',
    det:'Hoje, 08:45\n23/06/2026', status:'Crítico',  statusColor:'#f87171', statusBg:'rgba(192,57,43,0.2)', iconColor:'#c0392b' },
  { id:2, titulo:'Risco de lagarta',           desc:'Condições favoráveis para aumento populacional.',
    fazenda:'Fazenda Boa Vista',   talhao:'Talhão 7 • Milho', cat:'Pragas',    catIcon:TriangleAlert,
    sev:'Média', sevColor:'#c9933a', sevBg:'rgba(201,147,58,0.2)',
    det:'Hoje, 07:30\n23/06/2026', status:'Atenção', statusColor:'#e8b05a', statusBg:'rgba(201,147,58,0.2)', iconColor:'#c9933a' },
  { id:3, titulo:'Baixa nutrição do solo',     desc:'Baixos níveis de nitrogênio detectados.',
    fazenda:'Fazenda São Miguel',  talhao:'Talhão 3 • Soja',  cat:'Solo',      catIcon:Leaf,
    sev:'Média', sevColor:'#c9933a', sevBg:'rgba(201,147,58,0.2)',
    det:'Ontem, 16:10\n22/06/2026',status:'Monitorar',statusColor:'#4a9fbf', statusBg:'rgba(74,159,191,0.2)',iconColor:'#c9933a' },
  { id:4, titulo:'Saúde vegetal estável',      desc:'Índices dentro do ideal para o estágio atual da cultura.',
    fazenda:'Fazenda Horizonté',   talhao:'Talhão 5 • Milho', cat:'Saúde',     catIcon:Leaf,
    sev:'Baixa', sevColor:'#6aab7a', sevBg:'rgba(74,124,89,0.2)',
    det:'Ontem, 14:20\n22/06/2026',status:'Saudável',statusColor:'#6aab7a', statusBg:'rgba(74,124,89,0.2)', iconColor:'#6aab7a' },
]

const pieData = [
  { name:'Irrigação', value:6, color:'#4a9fbf' },
  { name:'Pragas',    value:5, color:'#c9933a' },
  { name:'Solo',      value:4, color:'#8b6914' },
  { name:'Clima',     value:3, color:'#4a7c59' },
  { name:'Saúde',     value:2, color:'#6aab7a' },
]

const tendencia = [
  { d:'23/06', saude:75, umidade:60, pragas:45, solo:55, irrigacao:80 },
  { d:'24/06', saude:78, umidade:62, pragas:47, solo:56, irrigacao:82 },
  { d:'25/06', saude:80, umidade:63, pragas:48, solo:57, irrigacao:85 },
  { d:'26/06', saude:82, umidade:63, pragas:50, solo:58, irrigacao:87 },
  { d:'27/06', saude:83, umidade:64, pragas:50, solo:60, irrigacao:88 },
  { d:'28/06', saude:85, umidade:64, pragas:52, solo:61, irrigacao:90 },
  { d:'29/06', saude:87, umidade:64, pragas:50, solo:62, irrigacao:91 },
]

const insights = [
  { icon:Leaf,         color:'#6aab7a', bg:'#2d4f3a', text:'A saúde geral da lavoura melhorou 6% comparado ao período anterior.' },
  { icon:TriangleAlert,color:'#c9933a', bg:'rgba(201,147,58,0.15)', text:'Atenção ao estresse hídrico no Talhão 12 da Fazenda Santa Clara.' },
  { icon:Droplets,     color:'#4a9fbf', bg:'#1e3a5a', text:'A umidade do solo está dentro da faixa ideal na maioria das áreas.' },
]

const recomendacoes = [
  { icon:Droplets,     titulo:'Ajustar irrigação',          desc:'Reduzir intervalo de irrigação no Talhão 12 para evitar estresse hídrico.' },
  { icon:TriangleAlert,titulo:'Aplicar defensivo preventivo',desc:'Área com risco moderado de lagarta. Recomendamos aplicação preventiva.'    },
  { icon:Leaf,         titulo:'Reforçar nutrientes',        desc:'Solo com baixa retenção de nitrogênio. Recomendamos adubação nitrogenada.'  },
  { icon:CloudRain,    titulo:'Acompanhar previsão',        desc:'Chuva prevista para os próximos dias. Monitore o desenvolvimento das culturas.'},
]

const talhoesMapa = [
  { cor:'#c0392b', fill:'#c0392b66', coords:[[-24.010,-52.380],[-23.995,-52.358],[-24.008,-52.342],[-24.023,-52.364]], label:'⚠' },
  { cor:'#c9933a', fill:'#c9933a66', coords:[[-24.052,-52.358],[-24.035,-52.336],[-24.048,-52.320],[-24.065,-52.342]], label:'⚠' },
  { cor:'#4a7c59', fill:'#4a7c5966', coords:[[-23.998,-52.400],[-23.980,-52.378],[-23.993,-52.362],[-24.011,-52.384]], label:'✓' },
  { cor:'#4a7c59', fill:'#4a7c5966', coords:[[-24.068,-52.375],[-24.050,-52.353],[-24.063,-52.337],[-24.081,-52.359]], label:'✓' },
]

function MiniSpark({ data, color }) {
  const pts = data.map(v => ({ v }))
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={pts}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false}/>
      </LineChart>
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

function Select({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', borderRadius:8,
                  background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)',
                  fontSize:13, color:'var(--color-brand-text)', cursor:'pointer' }}>
      {label} <ChevronDown size={13} style={{ color:'var(--color-brand-muted)' }}/>
    </div>
  )
}

export default function Diagnostico() {
  return (
    <div className="dashboard-scroll" style={{ display:'flex', flexDirection:'column', gap:14, padding:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:'#2d4f3a',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ClipboardList size={20} style={{ color:'#6aab7a' }}/>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>Diagnósticos</h1>
            <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>
              Análises inteligentes e recomendações para suas fazendas.
            </p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Select label="Todas as fazendas"/>
          <Select label="Todos os talhões"/>
          <Select label="23/06/2026 – 29/06/2026"/>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--color-brand-muted)' }}>
            <RefreshCw size={13}/> Atualizado há 8 min
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {kpis.map(k => (
          <Card key={k.label} style={{ padding:16 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
              <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>{k.label}</p>
              <div style={{ width:40, height:40, borderRadius:10, background:k.iconBg,
                            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <k.icon size={18} style={{ color:k.iconColor }}/>
              </div>
            </div>
            <p style={{ fontSize:28, fontWeight:700, color: k.label==='Risco de pragas'?k.subColor:'var(--color-brand-text)', margin:'0 0 2px', lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:12, color:k.subColor, margin:'0 0 6px' }}>{k.sub}</p>
            <MiniSpark data={k.spark} color={k.iconColor}/>
            <p style={{ fontSize:11, color:k.trendColor, margin:'4px 0 0' }}>↑ {k.trend}</p>
          </Card>
        ))}
      </div>

      {/* Tabela + mapa */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:12 }}>

        {/* Tabela diagnósticos */}
        <Card style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
            <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 2px' }}>Diagnósticos detalhados</p>
            <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:0 }}>Principais análises identificadas no período selecionado.</p>
          </div>

          {/* Cabeçalho */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1.2fr 1fr 28px',
                        padding:'8px 16px', borderBottom:'1px solid var(--color-brand-border)' }}>
            {['Diagnóstico','Fazenda / Talhão','Categoria','Severidade','Detectado em','Status',''].map(h => (
              <span key={h} style={{ fontSize:11, color:'var(--color-brand-muted)', fontWeight:500 }}>{h}</span>
            ))}
          </div>

          {diagnosticos.map((d,i) => (
            <div key={d.id}
                 style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1.2fr 1fr 28px',
                          padding:'12px 16px', alignItems:'center',
                          borderBottom: i<diagnosticos.length-1?'1px solid var(--color-brand-border)':'none',
                          transition:'background .15s' }}
                 onMouseEnter={e=>e.currentTarget.style.background='rgba(74,124,89,0.05)'}
                 onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <TriangleAlert size={15} style={{ color:d.iconColor, flexShrink:0, marginTop:2 }}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>{d.titulo}</p>
                  <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0', lineHeight:1.4 }}>{d.desc}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:500, color:'var(--color-brand-text)', margin:0 }}>{d.fazenda}</p>
                <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>{d.talhao}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <d.catIcon size={13} style={{ color:'var(--color-brand-muted)' }}/>
                <span style={{ fontSize:12, color:'var(--color-brand-text)' }}>{d.cat}</span>
              </div>
              <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                             background:d.sevBg, color:d.sevColor, width:'fit-content' }}>{d.sev}</span>
              <div>
                {d.det.split('\n').map((l,i) => (
                  <p key={i} style={{ fontSize:11, color:i===0?'var(--color-brand-text)':'var(--color-brand-muted)', margin:0 }}>{l}</p>
                ))}
              </div>
              <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                             background:d.statusBg, color:d.statusColor, width:'fit-content' }}>{d.status}</span>
              <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-brand-muted)' }}>
                <MoreHorizontal size={15}/>
              </button>
            </div>
          ))}

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'10px 16px', borderTop:'1px solid var(--color-brand-border)' }}>
            <span style={{ fontSize:12, color:'var(--color-brand-muted)' }}>Mostrando 1–4 de 4 diagnósticos</span>
            <div style={{ display:'flex', gap:4 }}>
              {[ChevronLeft, null, ChevronRight].map((C,i) => C ? (
                <button key={i} style={{ width:28, height:28, borderRadius:6, background:'var(--color-brand-bg)',
                                          border:'1px solid var(--color-brand-border)', cursor:'pointer',
                                          display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-brand-muted)' }}>
                  <C size={13}/>
                </button>
              ) : (
                <button key={i} style={{ width:28, height:28, borderRadius:6, background:'var(--color-brand-green)',
                                          border:'none', cursor:'pointer', fontSize:12, color:'#fff', fontWeight:600 }}>1</button>
              ))}
            </div>
          </div>
        </Card>

        {/* Mapa diagnóstico */}
        <Card style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)',
                        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:0 }}>Mapa de diagnóstico</p>
              <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'2px 0 0' }}>Visualização das condições das áreas no período.</p>
            </div>
            <div style={{ display:'flex', gap:10, fontSize:11 }}>
              {[['#c0392b','Crítico'],['#c9933a','Atenção'],['#6aab7a','Saudável']].map(([c,l])=>(
                <span key={l} style={{ display:'flex', alignItems:'center', gap:4, color:'var(--color-brand-muted)' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <MapContainer center={[-24.038,-52.373]} zoom={12}
                          style={{ height:280, width:'100%' }} zoomControl={true}>
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
      </div>

      {/* Row 3 — distribuição + tendência + insights */}
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr 280px', gap:12 }}>

        {/* Distribuição */}
        <Card style={{ padding:16 }}>
          <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 4px' }}>Distribuição dos problemas</p>
          <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'0 0 14px' }}>Proporção por categoria no período selecionado.</p>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ position:'relative', width:90, height:90, flexShrink:0 }}>
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie data={pieData} cx={40} cy={40} innerRadius={28} outerRadius={42} dataKey="value" stroke="none">
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
                <div key={p.name} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:7, height:7, borderRadius:2, background:p.color, flexShrink:0 }}/>
                  <span style={{ fontSize:12, color:'var(--color-brand-muted)', flex:1 }}>{p.name}</span>
                  <span style={{ fontSize:12, color:'var(--color-brand-text)', fontFamily:'var(--font-mono)' }}>
                    {Math.round(p.value/20*100)}% ({p.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tendência */}
        <Card style={{ padding:16 }}>
          <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 2px' }}>Tendência geral</p>
          <p style={{ fontSize:11, color:'var(--color-brand-muted)', margin:'0 0 14px' }}>Evolução dos principais indicadores.</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={tendencia}>
              <XAxis dataKey="d" tick={{ fontSize:10, fill:'var(--color-brand-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{ fontSize:9, fill:'var(--color-brand-muted)' }} axisLine={false} tickLine={false}/>
              <RTooltip contentStyle={{ background:'var(--color-brand-surface)', border:'1px solid var(--color-brand-border)', fontSize:11 }}/>
              <Line type="monotone" dataKey="saude"    stroke="#6aab7a" strokeWidth={2} dot={false} name="Saúde"/>
              <Line type="monotone" dataKey="umidade"  stroke="#4a9fbf" strokeWidth={2} dot={false} name="Umidade do solo"/>
              <Line type="monotone" dataKey="pragas"   stroke="#c9933a" strokeWidth={2} dot={false} name="Pragas"/>
              <Line type="monotone" dataKey="solo"     stroke="#8b6914" strokeWidth={2} dot={false} name="Solo"/>
              <Line type="monotone" dataKey="irrigacao"stroke="#4a7c59" strokeWidth={2} dot={false} name="Irrigação"/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:8 }}>
            {[['#6aab7a','Saúde'],['#4a9fbf','Umidade do solo'],['#c9933a','Pragas'],['#8b6914','Solo'],['#4a7c59','Irrigação']].map(([c,l])=>(
              <span key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--color-brand-muted)' }}>
                <span style={{ width:14, height:2, background:c, display:'inline-block', borderRadius:2 }}/>{l}
              </span>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <Card style={{ padding:16, display:'flex', flexDirection:'column' }}>
          <p style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 14px' }}>Insights do período</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, flex:1 }}>
            {insights.map((ins,i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:ins.bg, flexShrink:0,
                              display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ins.icon size={13} style={{ color:ins.color }}/>
                </div>
                <p style={{ fontSize:12, color:'var(--color-brand-text)', margin:0, lineHeight:1.5 }}>{ins.text}</p>
              </div>
            ))}
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, marginTop:16,
                           color:'var(--color-brand-green-light)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            Ver todos os insights <ArrowRight size={12}/>
          </button>
        </Card>
      </div>

      {/* Recomendações da IA */}
      <Card>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)',
                      display:'flex', alignItems:'center', gap:8 }}>
          <Leaf size={15} style={{ color:'var(--color-brand-green-light)' }}/>
          <div>
            <span style={{ fontSize:14, fontWeight:600, color:'var(--color-brand-text)' }}>Recomendações da IA</span>
            <span style={{ fontSize:12, color:'var(--color-brand-muted)', marginLeft:8 }}>Ações sugeridas com base nos diagnósticos identificados.</span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
          {recomendacoes.map((r,i) => (
            <div key={r.titulo} style={{ padding:16, borderRight: i<3?'1px solid var(--color-brand-border)':'none' }}>
              <div style={{ width:34, height:34, borderRadius:8, background:'#2d4f3a',
                            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                <r.icon size={15} style={{ color:'#6aab7a' }}/>
              </div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 6px' }}>{r.titulo}</p>
              <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:'0 0 10px', lineHeight:1.5 }}>{r.desc}</p>
              <button style={{ fontSize:12, color:'var(--color-brand-green-light)', background:'none',
                               border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
                Ver detalhes <ArrowRight size={11}/>
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
