import { useMemo, useState } from 'react'
import { MapContainer, CircleMarker, Popup, TileLayer } from 'react-leaflet'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Edit2, Home, MapPin, Plus, RefreshCw, Trash2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Modal, SearchBox, Select, Skeleton, Toast } from '../components/ui/Primitives'
import { fallbackFarms } from '../data/operations'

const farmSchema = z.object({
  nome: z.string().min(3, 'Informe ao menos 3 caracteres.'),
  cidade: z.string().min(2, 'Informe a cidade.'),
  estado: z.string().min(2, 'Informe a UF.').max(2, 'Use a UF com 2 letras.'),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
})

const pageSize = 6

function normalizeFarm(farm) {
  return {
    ...farm,
    statusLabel: farm.status ?? (farm.activeAlerts > 0 ? 'Attention' : 'Active'),
    latitude: farm.latitude ?? farm.Latitude,
    longitude: farm.longitude ?? farm.Longitude,
  }
}

function statusTone(farm) {
  if ((farm.statusLabel ?? '').toLowerCase().includes('inactive')) return 'neutral'
  if ((farm.statusLabel ?? '').toLowerCase().includes('alert') || farm.activeAlerts > 2) return 'danger'
  if ((farm.statusLabel ?? '').toLowerCase().includes('attention') || farm.activeAlerts > 0) return 'warning'
  return 'success'
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
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('success')

  const farms = useMemo(() => (farmsRequest.data?.length ? farmsRequest.data : fallbackFarms).map(normalizeFarm), [farmsRequest.data])
  const filtered = useMemo(() => {
    return farms.filter(farm => {
      const text = `${farm.nome} ${farm.cidade} ${farm.estado}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const tone = statusTone(farm)
      return matchesQuery && (status === 'all' || tone === status)
    })
  }, [farms, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalArea = farms.reduce((sum, farm) => sum + (farm.fieldsCount ?? 0), 0)

  const saveFarm = async payload => {
    setBusy(true)
    try {
      if (modal?.farm?.id && !String(modal.farm.id).startsWith('demo-')) {
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
    if (String(farm.id).startsWith('demo-')) {
      setToast('Crie uma fazenda real para habilitar exclusão.')
      setToastTone('danger')
      return
    }
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Cadastro territorial</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Fazendas</h1>
          <p className="mt-1 text-sm text-muted">Gerencie propriedades, localização e status operacional.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchBox value={query} onChange={value => { setQuery(value); setPage(1) }} placeholder="Buscar fazenda..." />
          <Select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>
            <option value="all">Todos os status</option>
            <option value="success">Ativas</option>
            <option value="warning">Atenção</option>
            <option value="danger">Alerta</option>
          </Select>
          <Button variant="secondary" onClick={farmsRequest.refresh}><RefreshCw size={16} /> Atualizar</Button>
          <Button onClick={() => setModal({ mode: 'create' })}><Plus size={16} /> Nova fazenda</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-sm text-muted">Total</p><p className="mt-2 text-3xl font-extrabold">{farms.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Talhões</p><p className="mt-2 text-3xl font-extrabold">{totalArea}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Alertas ativos</p><p className="mt-2 text-3xl font-extrabold">{farms.reduce((s, f) => s + (f.activeAlerts ?? 0), 0)}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Saúde média</p><p className="mt-2 text-3xl font-extrabold">{Math.round(farms.reduce((s, f) => s + (f.healthIndex ?? 0), 0) / Math.max(farms.length, 1))}/100</p></Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="overflow-hidden">
          <CardHeader title="Inventário de fazendas" eyebrow={`${filtered.length} resultado(s)`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Fazenda</th>
                  <th className="px-4 py-3">Localização</th>
                  <th className="px-4 py-3">Talhões</th>
                  <th className="px-4 py-3">Saúde</th>
                  <th className="px-4 py-3">Alertas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {farmsRequest.loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}><td colSpan={7} className="p-4"><Skeleton className="h-10" /></td></tr>
                  ))
                ) : visible.length ? visible.map(farm => (
                  <tr key={farm.id} className="hover:bg-surface-muted/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary"><Home size={16} /></div>
                        <div><p className="font-bold text-ink">{farm.nome}</p><p className="text-xs text-muted">ID {String(farm.id).slice(0, 8)}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted"><MapPin size={14} className="mr-1 inline" />{farm.cidade}, {farm.estado}</td>
                    <td className="px-4 py-3 font-semibold">{farm.fieldsCount ?? 0}</td>
                    <td className="px-4 py-3 font-semibold">{Math.round(farm.healthIndex ?? 0)}/100</td>
                    <td className="px-4 py-3">{farm.activeAlerts ?? 0}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(farm)}>{statusTone(farm) === 'success' ? 'Ativa' : statusTone(farm) === 'warning' ? 'Atenção' : 'Alerta'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => setModal({ mode: 'edit', farm })}><Edit2 size={15} /></Button>
                        <Button variant="ghost" size="icon" title="Excluir" onClick={() => deleteFarm(farm)} loading={busy}><Trash2 size={15} /></Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="p-5"><EmptyState title="Nenhuma fazenda encontrada" text="Ajuste os filtros ou cadastre uma nova propriedade." /></td></tr>
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

        <Card className="overflow-hidden">
          <CardHeader title="Mapa das propriedades" eyebrow="Coordenadas cadastradas" />
          <div className="h-[360px]">
            <MapContainer center={[-24.5, -52.6]} zoom={6} className="h-full w-full">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
              {farms.filter(f => f.latitude && f.longitude).map(farm => (
                <CircleMarker key={farm.id} center={[farm.latitude, farm.longitude]} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: farm.activeAlerts ? '#a66812' : '#256f49', fillOpacity: 1 }}>
                  <Popup>{farm.nome}<br />{farm.cidade}, {farm.estado}</Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </Card>
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
