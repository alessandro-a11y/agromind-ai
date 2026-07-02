import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, Clock, RefreshCw, ShieldOff, TriangleAlert } from 'lucide-react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Badge, Button, Card, CardHeader, EmptyState, SearchBox, Select, Skeleton, Toast } from '../components/ui/Primitives'

const statusMap = {
  all: '',
  active: 0,
  resolved: 1,
  ignored: 2,
}

function toneForStatus(statusLabel) {
  const label = (statusLabel ?? '').toLowerCase()
  if (label.includes('resol')) return 'success'
  if (label.includes('ignor')) return 'neutral'
  return 'warning'
}

function typeColor(typeLabel) {
  const label = (typeLabel ?? '').toLowerCase()
  if (label.includes('clima')) return '#256d8f'
  if (label.includes('umidade')) return '#a66812'
  if (label.includes('praga')) return '#b42318'
  return '#256f49'
}

export default function Alertas() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState('')
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('success')

  const request = useAsync(() => agromindService.alerts({ status: statusMap[status], page, size: 8 }), [status, page])
  const items = useMemo(() => request.data?.items ?? [], [request.data])
  const totalPages = request.data?.totalPages ?? 1

  const filtered = useMemo(() => {
    return items.filter(alert => `${alert.tipoLabel} ${alert.descricao} ${alert.farmNome}`.toLowerCase().includes(query.toLowerCase()))
  }, [items, query])

  const chartData = useMemo(() => {
    const map = new Map()
    items.forEach(alert => map.set(alert.tipoLabel ?? 'Outros', (map.get(alert.tipoLabel ?? 'Outros') ?? 0) + 1))
    return Array.from(map, ([name, value]) => ({ name, value, color: typeColor(name) }))
  }, [items])

  const runAction = async (id, action) => {
    setBusyId(`${action}-${id}`)
    try {
      if (action === 'resolve') await agromindService.resolveAlert(id)
      if (action === 'ignore') await agromindService.ignoreAlert(id)
      setToast(action === 'resolve' ? 'Alerta resolvido.' : 'Alerta ignorado.')
      setToastTone('success')
      await request.refresh()
    } catch (err) {
      setToast(err.response?.data?.erro ?? 'Não foi possível atualizar o alerta.')
      setToastTone('danger')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Monitoramento ativo</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Alertas</h1>
          <p className="mt-1 text-sm text-muted">Triagem, priorização e encerramento de ocorrências operacionais.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchBox value={query} onChange={setQuery} placeholder="Buscar alertas..." />
          <Select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="resolved">Resolvidos</option>
            <option value="ignored">Ignorados</option>
          </Select>
          <Button variant="secondary" onClick={request.refresh}><RefreshCw size={16} /> Atualizar</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-sm text-muted">Resultados</p><p className="mt-2 text-3xl font-extrabold">{request.data?.totalCount ?? filtered.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Na página</p><p className="mt-2 text-3xl font-extrabold">{items.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Tipos</p><p className="mt-2 text-3xl font-extrabold">{chartData.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Página</p><p className="mt-2 text-3xl font-extrabold">{page}/{totalPages}</p></Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader title="Fila de alertas" eyebrow="Ações conectadas ao backend" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Alerta</th>
                  <th className="px-4 py-3">Fazenda</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Criado em</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {request.loading ? (
                  Array.from({ length: 5 }).map((_, index) => <tr key={index}><td colSpan={6} className="p-4"><Skeleton className="h-12" /></td></tr>)
                ) : filtered.length ? filtered.map(alert => (
                  <tr key={alert.id} className="hover:bg-surface-muted/70">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-warning-soft text-warning"><TriangleAlert size={17} /></div>
                        <div><p className="font-bold text-ink">{alert.tipoLabel ?? 'Alerta'}</p><p className="mt-1 max-w-xl text-xs text-muted">{alert.descricao}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{alert.farmNome}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: typeColor(alert.tipoLabel) }} />{alert.tipoLabel}</span></td>
                    <td className="px-4 py-3 text-muted">{alert.createdAt ? new Date(alert.createdAt).toLocaleString('pt-BR') : '-'}</td>
                    <td className="px-4 py-3"><Badge tone={toneForStatus(alert.statusLabel)}>{alert.statusLabel}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => runAction(alert.id, 'resolve')} loading={busyId === `resolve-${alert.id}`}><CheckCircle2 size={14} /> Resolver</Button>
                        <Button variant="ghost" size="sm" onClick={() => runAction(alert.id, 'ignore')} loading={busyId === `ignore-${alert.id}`}><ShieldOff size={14} /> Ignorar</Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="p-5"><EmptyState icon={Bell} title="Nenhum alerta encontrado" text="A API não retornou alertas para os filtros selecionados." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Distribuição por tipo" eyebrow="Página atual" />
            <div className="h-72 p-4">
              {chartData.length ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={60} outerRadius={90} stroke="none">
                      {chartData.map(item => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState title="Sem dados" text="Não há categorias para exibir." />}
            </div>
          </Card>

          <Card>
            <CardHeader title="SLA operacional" eyebrow="Diretriz de resposta" />
            <div className="space-y-3 p-4 text-sm text-muted">
              <p className="flex gap-2"><Clock size={16} className="text-danger" /> Alertas críticos devem ser tratados no mesmo turno.</p>
              <p className="flex gap-2"><Clock size={16} className="text-warning" /> Alertas médios entram na rota técnica do dia.</p>
              <p className="flex gap-2"><Clock size={16} className="text-primary" /> Alertas baixos podem ser agregados ao relatório semanal.</p>
            </div>
          </Card>
        </div>
      </div>

      <Toast message={toast} tone={toastTone} onClose={() => setToast('')} />
    </div>
  )
}
