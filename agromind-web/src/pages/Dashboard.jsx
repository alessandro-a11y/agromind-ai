import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  CloudSun,
  Droplet,
  MapPin,
  Plus,
  Thermometer,
  Wind,
  Sprout,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Card, CardHeader, CardBody, CardMetric } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonDashboard } from '../components/ui/Skeleton'

function farmPinIcon() {
  const html = renderToStaticMarkup(
    <MapPin size={14} color="#fff" strokeWidth={2.5} fill="#15803d" />
  )
  return L.divIcon({
    html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))">${html}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 26],
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const dashboard = useAsync(() => agromindService.dashboard(), [])

  const farms = dashboard.data?.farms ?? []
  const mappable = useMemo(() => farms.filter((f) => f.latitude && f.longitude), [farms])
  const mapCenter = mappable.length
    ? [mappable[0].latitude, mappable[0].longitude]
    : [-15.78, -47.93]

  const primaryFarm = farms[0]
  const weather = dashboard.data?.primaryFarmWeather
  const alerts = dashboard.data?.recentAlerts ?? []
  const alertasAtivos = dashboard.data?.alertasAtivos ?? 0
  const totalCulturas = dashboard.data?.totalCulturas ?? farms.length * 3

  if (dashboard.loading) {
    return <SkeletonDashboard />
  }

  if (dashboard.error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Erro ao carregar o painel"
        text="Não foi possível obter os dados do dashboard. Verifique sua conexão e tente novamente."
        action={
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        }
      />
    )
  }

  if (!farms.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="Nenhuma fazenda cadastrada"
        text="Cadastre sua primeira fazenda para começar a monitorar clima, alertas e diagnósticos."
        action={
          <Button size="sm" leftIcon={Plus} onClick={() => navigate('/fazendas')}>
            Cadastrar fazenda
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card hover>
          <CardBody>
            <CardMetric
              icon={MapPin}
              label="Fazendas"
              value={farms.length}
              color="text-primary"
            />
          </CardBody>
        </Card>
        <Card hover>
          <CardBody>
            <CardMetric
              icon={Sprout}
              label="Culturas ativas"
              value={totalCulturas}
              color="text-info"
            />
          </CardBody>
        </Card>
        <Card hover>
          <CardBody>
            <CardMetric
              icon={AlertCircle}
              label="Alertas ativos"
              value={alertasAtivos}
              trend={alertasAtivos > 0 ? 12 : 0}
              color="text-danger"
            />
          </CardBody>
        </Card>
        <Card hover>
          <CardBody>
            <CardMetric
              icon={TrendingUp}
              label="Score da fazenda"
              value={primaryFarm?.score ?? '-'}
              trend={primaryFarm?.score ? 5 : undefined}
              color="text-warning"
            />
          </CardBody>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Map */}
        <Card hover padding={false} className="flex h-[420px] flex-col">
          <CardHeader
            title="Visão da operação"
            eyebrow="Mapa"
            action={
              <Button variant="outline" size="sm" rightIcon={ArrowRight} onClick={() => navigate('/fazendas')}>
                Ver fazendas
              </Button>
            }
          />
          <CardBody className="flex flex-1 flex-col pt-0">
            <div className="relative flex-1 overflow-hidden rounded-lg border border-border/40">
              <MapContainer
                center={mapCenter}
                zoom={mappable.length > 1 ? 6 : 12}
                className="h-full w-full z-0"
                zoomControl={false}
              >
                <ZoomControl position="topleft" />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri"
                />
                {mappable.map((farm) => (
                  <Marker
                    key={farm.id}
                    position={[farm.latitude, farm.longitude]}
                    icon={farmPinIcon()}
                  />
                ))}
              </MapContainer>
            </div>
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Weather */}
          <Card hover>
            <CardHeader title={primaryFarm.nome} eyebrow="Fazenda principal" />
            <CardBody className="pt-0">
              <p className="mb-4 text-xs text-muted">
                {primaryFarm.cidade}, {primaryFarm.estado}
              </p>

              {weather ? (
                <div className="space-y-3.5">
                  {[
                    {
                      icon: Thermometer,
                      label: 'Temperatura',
                      value: `${weather.temperature.toFixed(1)}°C`,
                      color: 'text-red-400',
                    },
                    {
                      icon: Droplet,
                      label: 'Umidade',
                      value: `${weather.humidity.toFixed(0)}%`,
                      color: 'text-info',
                    },
                    {
                      icon: Wind,
                      label: 'Vento',
                      value: `${weather.windSpeed.toFixed(0)} km/h`,
                      color: 'text-muted',
                    },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon size={15} className={`shrink-0 ${color}`} />
                      <div>
                        <p className="text-[11px] text-muted">{label}</p>
                        <p className="text-sm font-bold text-ink">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">Sem dados climáticos sincronizados.</p>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="mt-4 px-0 text-primary hover:bg-transparent"
                rightIcon={ChevronRight}
                onClick={() =>
                  navigate('/fazendas', { state: { focusFarmId: primaryFarm.id } })
                }
              >
                Ver detalhes
              </Button>
            </CardBody>
          </Card>

          {/* Alerts */}
          <Card hover>
            <CardHeader
              title="Alertas ativos"
              eyebrow="Monitoramento"
              action={
                <Badge tone={alerts.length ? 'danger' : 'neutral'} dot={alerts.length > 0}>
                  {alertasAtivos} ativo{alertasAtivos !== 1 ? 's' : ''}
                </Badge>
              }
            />
            <CardBody className="pt-0">
              {alerts.length ? (
                <div className="space-y-2.5">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-soft/50 p-3"
                    >
                      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-danger" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{alert.tipoLabel}</p>
                        <p className="text-xs text-muted">{alert.farmNome}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-muted">
                        {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">Nenhum alerta ativo no momento.</p>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="mt-3 px-0 text-primary hover:bg-transparent"
                rightIcon={ChevronRight}
                onClick={() => navigate('/alertas')}
              >
                Ver todos os alertas
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Weather bottom card */}
      <Card hover>
        <CardHeader
          title="Condições meteorológicas"
          eyebrow="Clima"
          action={
            <Button variant="outline" size="sm" rightIcon={ChevronRight} onClick={() => navigate('/clima')}>
              Previsão completa
            </Button>
          }
        />
        <CardBody className="pt-0">
          {weather ? (
            <div className="flex items-center gap-5">
              <CloudSun size={44} className="text-warning" />
              <div>
                <p className="text-4xl font-black leading-none text-ink">
                  {weather.temperature.toFixed(0)}°C
                </p>
                <p className="mt-1.5 text-xs text-muted">
                  Atualizado às{' '}
                  {new Date(weather.measuredAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted">Sem sincronização climática recente.</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}