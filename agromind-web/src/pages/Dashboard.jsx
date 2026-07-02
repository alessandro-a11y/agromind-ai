import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Polygon, TileLayer, Tooltip } from 'react-leaflet'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { Activity, AlertTriangle, ArrowRight, Home, MapPin, RefreshCw, Sparkles, Sprout, TrendingUp } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { cropMix, fallbackFarms, fieldShapes, healthTrend, recommendations, weatherSeries } from '../data/operations'
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Toast } from '../components/ui/Primitives'

const statusTone = status => {
  if ((status ?? '').toLowerCase().includes('alert')) return 'danger'
  if ((status ?? '').toLowerCase().includes('attention')) return 'warning'
  return 'success'
}

const healthColor = value => {
  if (value >= 75) return '#256f49'
  if (value >= 55) return '#a66812'
  return '#b42318'
}

function KpiCard({ icon: Icon, label, value, detail, loading, tone = 'primary' }) {
  const colors = {
    primary: 'bg-primary-soft text-primary',
    info: 'bg-info-soft text-info',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
  }

  return (
    <Card className="dashboard-card dashboard-fade-in p-4">
      {loading ? (
        <>
          <Skeleton className="mb-3 h-4 w-28" />
          <Skeleton className="h-8 w-20" />
        </>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">{label}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-ink">{value}</p>
            <p className="mt-1 text-xs text-muted">{detail}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors[tone]}`}>
            <Icon size={21} />
          </div>
        </div>
      )}
    </Card>
  )
}

export default function Dashboard() {
  const [toast, setToast] = useState('')
  const dashboard = useAsync(() => agromindService.dashboard(), [])
  const farms = useAsync(() => agromindService.farms(), [])
  const alerts = useAsync(() => agromindService.alerts({ page: 1, size: 5 }), [])

  const farmRows = farms.data?.length ? farms.data : fallbackFarms
  const stats = dashboard.data ?? {
    totalFazendas: farmRows.length,
    totalTalhoes: farmRows.reduce((sum, farm) => sum + (farm.fieldsCount ?? 0), 0),
    totalCulturas: cropMix.length,
    alertasAtivos: farmRows.reduce((sum, farm) => sum + (farm.activeAlerts ?? 0), 0),
    diagnosticosHoje: 0,
  }

  const averageHealth = useMemo(() => {
    if (!farmRows.length) return 0
    return Math.round(farmRows.reduce((sum, farm) => sum + (farm.healthIndex ?? 0), 0) / farmRows.length)
  }, [farmRows])

  const activeAlerts = alerts.data?.items ?? []
  const refreshAll = async () => {
    await Promise.all([dashboard.refresh(), farms.refresh(), alerts.refresh()])
    setToast('Dados atualizados.')
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-surface via-surface to-surface-muted p-6 shadow-[0_16px_48px_rgba(79,226,136,0.1)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft/50 px-3 py-1.5 text-sm font-semibold text-primary">
              <Sparkles size={14} />
              Centro de operações
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-ink">Panorama operacional</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">Fazendas, clima, alertas e saúde das áreas em uma visão executiva e preparada para decisão.</p>
          </div>
          <Button variant="secondary" onClick={refreshAll}>
            <RefreshCw size={16} /> Atualizar
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard loading={dashboard.loading} icon={Home} label="Fazendas" value={stats.totalFazendas} detail="propriedades cadastradas" />
        <KpiCard loading={dashboard.loading} icon={MapPin} label="Talhões" value={stats.totalTalhoes} detail="áreas produtivas" tone="info" />
        <KpiCard loading={dashboard.loading} icon={Sprout} label="Culturas" value={stats.totalCulturas} detail="safras monitoradas" />
        <KpiCard loading={dashboard.loading} icon={AlertTriangle} label="Alertas ativos" value={stats.alertasAtivos} detail="requerem ação" tone={stats.alertasAtivos ? 'danger' : 'primary'} />
        <KpiCard loading={dashboard.loading} icon={Activity} label="Saúde média" value={`${averageHealth}/100`} detail="índice consolidado" tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="dashboard-card overflow-hidden">
          <CardHeader
            title="Mapa de saúde dos talhões"
            eyebrow="GIS operacional"
            action={<Link to="/fazendas" className="text-sm font-semibold text-primary hover:text-primary-strong">Ver fazendas</Link>}
          />
          <div className="h-[420px] p-3">
            <MapContainer center={[-24.038, -52.373]} zoom={12} className="h-full w-full" zoomControl>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri, Maxar" />
              {fieldShapes.map(field => (
                <Polygon
                  key={field.id}
                  positions={field.coords}
                  pathOptions={{ color: healthColor(field.healthIndex), fillColor: healthColor(field.healthIndex), fillOpacity: 0.42, weight: 2 }}
                >
                  <Tooltip permanent direction="center" className="leaflet-tooltip-clean">
                    <span className="rounded-md border bg-white/95 px-2 py-1 text-xs font-bold shadow-sm" style={{ color: healthColor(field.healthIndex), borderColor: healthColor(field.healthIndex) }}>
                      {field.nome}
                    </span>
                  </Tooltip>
                </Polygon>
              ))}
            </MapContainer>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="dashboard-card">
            <CardHeader title="Alertas prioritários" eyebrow="Fila de risco" action={<Link to="/alertas" className="text-sm font-semibold text-primary">Abrir</Link>} />
            <div className="space-y-2 p-4">
              {alerts.loading ? (
                Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14" />)
              ) : activeAlerts.length ? (
                activeAlerts.map(alert => (
                  <div key={alert.id} className="rounded-xl border border-border bg-surface-muted p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink">{alert.tipoLabel ?? 'Alerta'}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">{alert.descricao}</p>
                      </div>
                      <Badge tone={statusTone(alert.statusLabel)}>{alert.statusLabel}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted">{alert.farmNome}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="Sem alertas ativos" text="Nenhuma ocorrência pendente foi retornada pela API." />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recomendações" eyebrow="Ações sugeridas" />
            <div className="divide-y divide-border">
              {recommendations.map(item => (
                <div key={item.title} className="p-4 transition-colors duration-200 hover:bg-surface-muted/70">
                  <p className="text-sm font-bold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="dashboard-card lg:col-span-2">
          <CardHeader title="Tendência dos indicadores" eyebrow="Últimos 30 dias" />
          <div className="h-72 p-4">
            <ResponsiveContainer>
              <AreaChart data={healthTrend} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="health" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#256f49" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#256f49" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e6ece3" vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                <ChartTooltip
                  cursor={{ stroke: '#256f49', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: 12, borderColor: '#dde5da', boxShadow: '0 10px 24px rgba(20,32,24,0.08)' }}
                />
                <Area type="monotone" dataKey="health" name="Saúde" stroke="#256f49" fill="url(#health)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="water" name="Umidade" stroke="#256d8f" fill="#256d8f22" strokeWidth={2.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Mix de culturas" eyebrow="Área monitorada" />
          <div className="flex h-72 items-center gap-4 p-4">
            <ResponsiveContainer width="48%" height="100%">
              <PieChart>
                <Pie data={cropMix} innerRadius={48} outerRadius={74} dataKey="value" stroke="none" paddingAngle={2}>
                  {cropMix.map(item => <Cell key={item.name} fill={item.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {cropMix.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
                  <span className="flex-1 text-muted">{item.name}</span>
                  <span className="font-bold text-ink">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Clima semanal" eyebrow="Precipitação e temperatura" action={<Link to="/clima" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Detalhes <ArrowRight size={14} /></Link>} />
        <div className="h-64 p-4">
          <ResponsiveContainer>
            <BarChart data={weatherSeries} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#e6ece3" vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
              <ChartTooltip
                cursor={{ fill: 'rgba(37,111,73,0.06)' }}
                contentStyle={{ borderRadius: 12, borderColor: '#dde5da', boxShadow: '0 10px 24px rgba(20,32,24,0.08)' }}
              />
              <Bar dataKey="rain" name="Chuva (mm)" fill="#256d8f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="temp" name="Temperatura (C)" fill="#a66812" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
