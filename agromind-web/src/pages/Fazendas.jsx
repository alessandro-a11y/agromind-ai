import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Bean, Edit2, Home, MapPin, MoreVertical, Plus, RefreshCw, Sprout, Trash2, Wheat, SlidersHorizontal
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Modal, SearchBox, Select, Skeleton, Toast } from '../components/ui/Primitives'

const farmSchema = z.object({
  nome: z.string().min(3, 'Informe ao menos 3 caracteres.'),
  cidade: z.string().min(2, 'Informe a cidade.'),
  estado: z.string().min(2, 'Informe a UF.').max(2, 'Use a UF com 2 letras.'),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
})

const pageSize = 8

const cultureMeta = {
  Soja: { icon: Sprout, color: '#22c55e' },
  Milho: { icon: Sprout, color: '#eab308' },
  Trigo: { icon: Wheat, color: '#60a5fa' },
  Feijão: { icon: Bean, color: '#ef4444' },
}
const defaultCultureMeta = { icon: Sprout, color: '#9ca3af' }

const statusColors = {
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  neutral: '#6b7280',
}
const statusLabels = { success: 'Ativa', warning: 'Atenção', danger: 'Alerta', neutral: 'Inativa' }

function normalizeFarm(farm) {
  return {
    ...farm,
    statusLabel: farm.status ?? (farm.activeAlerts > 0 ? 'Attention' : 'Active'),
    latitude: farm.latitude ?? farm.Latitude,
    longitude: farm.longitude ?? farm.Longitude,
    areaHa: farm.areaHa ?? farm.area ?? null,
    cultura: farm.cultura ?? farm.crop ?? null,
    safra: farm.safra ?? farm.season ?? null,
    updatedAt: farm.updatedAt ?? farm.lastUpdate ?? null,
    talhoesLabel: farm.talhoesLabel ?? farm.talhoes ?? null,
  }
}

function statusTone(farm) {
  const areaZero = !farm.fieldsCount && !farm.areaHa
  if ((farm.statusLabel ?? '').toLowerCase().includes('inactive') || areaZero) return 'neutral'
  if ((farm.statusLabel ?? '').toLowerCase().includes('alert') || farm.activeAlerts > 2) return 'danger'
  if ((farm.statusLabel ?? '').toLowerCase().includes('attention') || farm.activeAlerts > 0) return 'warning'
  return 'success'
}

function healthColor(value) {
  if (value == null) return '#525252'
  if (value < 60) return '#ef4444'
  if (value < 75) return '#eab308'
  return '#22c55e'
}

// Sparkline determinístico a partir do índice de saúde — visual, não série real.
function sparklinePoints(seed) {
  let x = seed || 1
  const rand = () => {
    x = (x * 9301 + 49297) % 233280
    return x / 233280
  }
  const pts = Array.from({ length: 7 }, (_, i) => {
    const y = 4 + rand() * 12
    return `${i * 8.6},${y.toFixed(1)}`
  })
  return pts.join(' ')
}

function Sparkline({ seed, color }) {
  return (
    <svg width="52" height="18" viewBox="0 0 52 18" className="shrink-0">
      <polyline points={sparklinePoints(seed)} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatCard({ label, value, unit, hint, icon: Icon, iconColor }) {
  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1.5 text-2xl font-extrabold text-ink leading-none">
          {value}
          {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
        </p>
        <p className="mt-1 text-[11px] text-muted/80 truncate">{hint}</p>
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${iconColor}1a`, color: iconColor }}>
        <Icon size={20} />
      </div>
    </Card>
  )
}

function RowMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(v => !v)} aria-label="Mais ações">
        <MoreVertical size={16} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-muted"
              onClick={() => { setOpen(false); onEdit() }}
            >
              <Edit2 size={14} /> Editar
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
              onClick={() => { setOpen(false); onDelete() }}
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function farmPinIcon(tone) {
  const color = statusColors[tone]
  const html = renderToStaticMarkup(<MapPin size={13} color="#fff" strokeWidth={2.5} fill={color} />)
  return L.divIcon({
    html: `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${html}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 24],
  })
}

function CultureDonut({ farms }) {
  const totals = useMemo(() => {
    const map = new Map()
    farms.forEach(f => {
      if (!f.cultura || !f.areaHa) return
      map.set(f.cultura, (map.get(f.cultura) ?? 0) + f.areaHa)
    })
    return [...map.entries()]
      .map(([cultura, ha]) => ({ cultura, ha, ...(cultureMeta[cultura] ?? defaultCultureMeta) }))
      .sort((a, b) => b.ha - a.ha)
  }, [farms])

  const total = totals.reduce((s, t) => s + t.ha, 0)

  const gradient = useMemo(() => {
    if (!total) return 'conic-gradient(#1c1f1c 0deg 360deg)'
    let acc = 0
    const stops = totals.map(t => {
      const start = (acc / total) * 360
      acc += t.ha
      const end = (acc / total) * 360
      return `${t.color} ${start}deg ${end}deg`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [totals, total])

  if (!total) {
    return <EmptyState title="Sem dados de cultura" text="Cadastre a cultura principal das fazendas." />
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-[#111311] text-center">
          <p className="text-lg font-extrabold text-white leading-none">{total.toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-[#737373] mt-0.5">ha</p>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {totals.map(t => (
          <div key={t.cultura} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="flex-1 font-medium text-ink">{t.cultura}</span>
            <span className="text-muted">{t.ha.toLocaleString('pt-BR')} ha ({Math.round((t.ha / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FarmForm({ initial, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(farmSchema),
    defaultValues: initial ?? { nome: '', cidade: '', estado: '', latitude: '', longitude: '' },
  })

  const submit = values => {
    onSubmit({
      nome: values.nome,
      cidade: values.cidade,
      estado: values.estado.toUpperCase(),
      latitude: values.latitude === '' ? null : Number(values.latitude),
      longitude: values.longitude === '' ? null : Number(values.longitude),
    })
  }

  return (
    <form id="farm-form" onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome" error={errors.nome?.message}>
        <Input {...register('nome')} placeholder="Fazenda Santa Clara" />
      </Field>
      <Field label="Cidade" error={errors.cidade?.message}>
        <Input {...register('cidade')} placeholder="Campo Mourão" />
      </Field>
      <Field label="Estado" error={errors.estado?.message}>
        <Input {...register('estado')} placeholder="PR" maxLength={2} />
      </Field>
      <Field label="Latitude" error={errors.latitude?.message}>
        <Input {...register('latitude')} placeholder="-24.038" />
      </Field>
      <Field label="Longitude" error={errors.longitude?.message}>
        <Input {...register('longitude')} placeholder="-52.373" />
      </Field>
      <button className="hidden" disabled={loading} />
    </form>
  )
}

export default function Fazendas() {
  const farmsRequest = useAsync(() => agromindService.farms(), [])
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('success')

const farms = useMemo(() => (farmsRequest.data ?? []).map(normalizeFarm), [farmsRequest.data])

  const filtered = useMemo(() => {
    return farms.filter(farm => {
      const text = `${farm.nome} ${farm.cidade} ${farm.estado}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const tone = statusTone(farm)
      const matchesTab = tab === 'all' || (tab === 'active' && tone !== 'neutral') || (tab === 'inactive' && tone === 'neutral')
      return matchesQuery && matchesTab
    })
  }, [farms, query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalArea = farms.reduce((sum, farm) => sum + (farm.areaHa ?? 0), 0)
  const activeCount = farms.filter(f => statusTone(f) !== 'neutral').length
  const alertCount = farms.reduce((s, f) => s + (f.activeAlerts ?? 0), 0)
  const avgHealth = Math.round(farms.reduce((s, f) => s + (f.healthIndex ?? 0), 0) / Math.max(farms.length, 1))

  const saveFarm = async payload => {
    setBusy(true)
    try {
      if (modal?.farm?.id) {
        await agromindService.updateFarm(modal.farm.id, payload)
        setToast('Fazenda atualizada.')
      } else {
        await agromindService.createFarm(payload)
        setToast('Fazenda criada.')
      }
      setToastTone('success')
      setModal(null)
      await farmsRequest.refresh()
    } catch (err) {
      setToast(err.response?.data?.erro ?? 'Não foi possível salvar a fazenda.')
      setToastTone('danger')
    } finally {
      setBusy(false)
    }
  }

  const deleteFarm = async farm => {
    setBusy(true)
    try {
      await agromindService.deleteFarm(farm.id)
      setToast('Fazenda removida.')
      setToastTone('success')
      await farmsRequest.refresh()
    } catch (err) {
      setToast(err.response?.data?.erro ?? 'Não foi possível remover.')
      setToastTone('danger')
    } finally {
      setBusy(false)
    }
  }

  const statusCounts = useMemo(() => {
    const counts = { success: 0, warning: 0, danger: 0, neutral: 0 }
    farms.forEach(f => { counts[statusTone(f)] += 1 })
    return counts
  }, [farms])

  const tabs = [
    { key: 'all', label: 'Todas as fazendas' },
    { key: 'active', label: 'Fazendas ativas' },
    { key: 'inactive', label: 'Fazendas inativas' },
  ]

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Home size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">Fazendas</h1>
            <p className="text-sm text-muted">Gerencie suas propriedades e acompanhe o desempenho de cada uma delas.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchBox value={query} onChange={value => { setQuery(value); setPage(1) }} placeholder="Buscar fazenda..." />
          <Button variant="secondary"><SlidersHorizontal size={16} /> Filtros</Button>
          <Button onClick={() => setModal({ mode: 'create' })}><Plus size={16} /> Nova fazenda</Button>
        </div>
      </div>

      {/* Cards de estatística */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total de fazendas" value={farms.length} hint="propriedades cadastradas" icon={Home} iconColor="#22c55e" />
        <StatCard label="Área total monitorada" value={totalArea.toLocaleString('pt-BR')} unit="ha" hint="área consolidada" icon={MapPin} iconColor="#0d9488" />
        <StatCard label="Fazendas ativas" value={activeCount} hint="em monitoramento" icon={Sprout} iconColor="#22c55e" />
        <StatCard label="Alertas ativos" value={alertCount} hint="requerem atenção" icon={Bean} iconColor="#ef4444" />
        <StatCard label="Índice médio de saúde" value={avgHealth} unit="/100" hint="das áreas monitoradas" icon={Sprout} iconColor={healthColor(avgHealth)} />
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1) }}
            className={`relative px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key ? 'text-primary' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
            {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        {/* Tabela */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Fazenda</th>
                  <th className="px-4 py-3">Localização</th>
                  <th className="px-4 py-3">Área (ha)</th>
                  <th className="px-4 py-3">Índice de saúde</th>
                  <th className="px-4 py-3">Cultura principal</th>
                  <th className="px-4 py-3">Última atualização</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {farmsRequest.loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}><td colSpan={8} className="p-4"><Skeleton className="h-10" /></td></tr>
                  ))
                ) : visible.length ? visible.map(farm => {
                  const tone = statusTone(farm)
                  const culture = cultureMeta[farm.cultura] ?? defaultCultureMeta
                  const CultureIcon = culture.icon
                  return (
                    <tr key={farm.id} className="hover:bg-surface-muted/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-14 shrink-0 rounded-lg bg-cover bg-center"
                            style={
                              farm.thumbnail
                                ? { backgroundImage: `url(${farm.thumbnail})` }
                                : { background: `linear-gradient(135deg, ${statusColors[tone]}55, #111311)` }
                            }
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate">{farm.nome}</p>
                            <p className="text-xs text-muted truncate">{farm.talhoesLabel ?? `${farm.fieldsCount ?? 0} talhão(ões)`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">
                        <MapPin size={14} className="mr-1 inline" />{farm.cidade}, {farm.estado}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">
                        {farm.areaHa ? farm.areaHa.toLocaleString('pt-BR') : '0'} ha
                      </td>
                      <td className="px-4 py-3">
                        {farm.healthIndex != null && farm.areaHa ? (
                          <div className="flex items-center gap-2">
                            <Sprout size={13} style={{ color: healthColor(farm.healthIndex) }} className="shrink-0" />
                            <span className="font-semibold text-ink">{Math.round(farm.healthIndex)}<span className="text-[10px] font-normal text-muted">/100</span></span>
                            <Sparkline seed={farm.id?.length ?? 5} color={healthColor(farm.healthIndex)} />
                          </div>
                        ) : (
                          <span className="text-muted">Sem dados</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {farm.cultura ? (
                          <div className="flex items-center gap-1.5">
                            <CultureIcon size={13} style={{ color: culture.color }} />
                            <div>
                              <p className="text-ink font-medium leading-none">{farm.cultura}</p>
                              {farm.safra && <p className="text-[11px] text-muted mt-0.5">Safra {farm.safra}</p>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{farm.updatedAt ?? '—'}</td>
                      <td className="px-4 py-3"><Badge tone={tone}>{statusLabels[tone]}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <RowMenu onEdit={() => setModal({ mode: 'edit', farm })} onDelete={() => deleteFarm(farm)} />
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={8} className="p-5"><EmptyState title="Nenhuma fazenda encontrada" text="Ajuste os filtros ou cadastre uma nova propriedade." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
            </div>
          </div>
        </Card>

        {/* Coluna lateral: mapa + donut */}
        <div className="flex flex-col gap-5">
          <Card className="overflow-hidden">
            <CardHeader title="Mapa das fazendas" />
            <div className="h-[300px]">
              <MapContainer center={[-24.5, -52.6]} zoom={6} className="h-full w-full">
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
                {farms.filter(f => f.latitude && f.longitude).map(farm => (
                  <Marker key={farm.id} position={[farm.latitude, farm.longitude]} icon={farmPinIcon(statusTone(farm))}>
                    <Popup>{farm.nome}<br />{farm.cidade}, {farm.estado}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Ativa <span className="text-muted">({statusCounts.success})</span></span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#eab308]" /> Atenção <span className="text-muted">({statusCounts.warning})</span></span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Alerta <span className="text-muted">({statusCounts.danger})</span></span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#6b7280]" /> Inativa <span className="text-muted">({statusCounts.neutral})</span></span>
            </div>
          </Card>

          <Card className="p-4">
            <CardHeader title="Resumo por cultura" className="mb-3" />
            <CultureDonut farms={farms} />
          </Card>
        </div>
      </div>

      <Modal
        open={!!modal}
        title={modal?.mode === 'edit' ? 'Editar fazenda' : 'Nova fazenda'}
        onClose={() => setModal(null)}
        footer={[
          <Button key="cancel" variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>,
          <Button key="save" type="submit" form="farm-form" loading={busy}>Salvar</Button>,
        ]}
      >
        <FarmForm initial={modal?.farm} onSubmit={saveFarm} loading={busy} />
      </Modal>

      <Toast message={toast} tone={toastTone} onClose={() => setToast('')} />
    </div>
  )
}