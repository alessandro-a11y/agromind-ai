import { useEffect, useMemo, useState } from 'react'
import { Activity, ClipboardList, Download, Leaf, Play, RefreshCw, Sprout, TriangleAlert } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { healthTrend } from '../data/operations'
import { Badge, Button, Card, CardHeader, EmptyState, Select, Skeleton, Toast } from '../components/ui/Primitives'

function riskTone(value) {
  const text = String(value ?? '').toLowerCase()
  if (text.includes('crit') || text.includes('alta')) return 'danger'
  if (text.includes('aten') || text.includes('media')) return 'warning'
  return 'success'
}

export default function Diagnostico() {
  const farms = useAsync(() => agromindService.farms(), [])
  const [farmId, setFarmId] = useState('')
  const [fieldId, setFieldId] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('success')

  const selectedFarmId = farmId || farms.data?.[0]?.id
  const fields = useAsync(() => selectedFarmId ? agromindService.fields(selectedFarmId) : Promise.resolve([]), [selectedFarmId])

  useEffect(() => {
    setFieldId('')
  }, [selectedFarmId])

  const selectedFieldId = fieldId || fields.data?.[0]?.id
  const history = useAsync(() => selectedFieldId ? agromindService.diagnosisHistory(selectedFieldId) : Promise.resolve([]), [selectedFieldId])

  const selectedField = useMemo(() => fields.data?.find(field => field.id === selectedFieldId), [fields.data, selectedFieldId])

  const createDiagnosis = async () => {
    if (!selectedFieldId) {
      setToast('Selecione um talhão para diagnosticar.')
      setToastTone('danger')
      return
    }
    setBusy(true)
    try {
      await agromindService.createDiagnosis(selectedFieldId)
      setToast('Diagnóstico criado.')
      setToastTone('success')
      await history.refresh()
    } catch (err) {
      setToast(err.response?.data?.erro ?? 'Não foi possível criar o diagnóstico.')
      setToastTone('danger')
    } finally {
      setBusy(false)
    }
  }

  const openHistoryReport = () => {
    if (!selectedFieldId) {
      setToast('Selecione um talhão para baixar relatório.')
      setToastTone('danger')
      return
    }
    window.open(agromindService.diagnosisHistoryReportUrl(selectedFieldId), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Análise agronômica</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Diagnósticos</h1>
          <p className="mt-1 text-sm text-muted">Execute diagnósticos por talhão e acompanhe o histórico gerado pelo backend.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedFarmId ?? ''} onChange={event => setFarmId(event.target.value)} disabled={farms.loading || !farms.data?.length}>
            {(farms.data ?? []).map(farm => <option key={farm.id} value={farm.id}>{farm.nome}</option>)}
          </Select>
          <Select value={selectedFieldId ?? ''} onChange={event => setFieldId(event.target.value)} disabled={fields.loading || !fields.data?.length}>
            {(fields.data ?? []).map(field => <option key={field.id} value={field.id}>{field.nome}</option>)}
          </Select>
          <Button variant="secondary" onClick={history.refresh}><RefreshCw size={16} /> Atualizar</Button>
          <Button onClick={createDiagnosis} loading={busy}><Play size={16} /> Novo diagnóstico</Button>
        </div>
      </div>

      {!farms.loading && !farms.data?.length ? (
        <EmptyState icon={ClipboardList} title="Nenhuma fazenda disponível" text="Cadastre uma fazenda e seus talhões para executar diagnósticos." />
      ) : !fields.loading && !fields.data?.length ? (
        <EmptyState icon={Sprout} title="Nenhum talhão cadastrado" text="A API retornou a fazenda, mas ainda não existem talhões para diagnóstico." />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Card className="p-4"><Leaf className="text-primary" /><p className="mt-3 text-sm text-muted">Talhão</p><p className="text-2xl font-extrabold">{selectedField?.nome ?? '-'}</p></Card>
            <Card className="p-4"><Sprout className="text-info" /><p className="mt-3 text-sm text-muted">Área</p><p className="text-2xl font-extrabold">{selectedField?.area ?? 0} ha</p></Card>
            <Card className="p-4"><Activity className="text-warning" /><p className="mt-3 text-sm text-muted">pH</p><p className="text-2xl font-extrabold">{selectedField?.ph ?? '-'}</p></Card>
            <Card className="p-4"><TriangleAlert className="text-danger" /><p className="mt-3 text-sm text-muted">Histórico</p><p className="text-2xl font-extrabold">{history.data?.length ?? 0}</p></Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <Card className="overflow-hidden">
              <CardHeader
                title="Histórico de diagnósticos"
                eyebrow="Registros retornados pela API"
                action={<Button variant="secondary" size="sm" onClick={openHistoryReport}><Download size={14} /> Relatório</Button>}
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-3">Diagnóstico</th>
                      <th className="px-4 py-3">Resultado</th>
                      <th className="px-4 py-3">Risco</th>
                      <th className="px-4 py-3">Criado em</th>
                      <th className="px-4 py-3 text-right">Relatório</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.loading ? (
                      Array.from({ length: 4 }).map((_, index) => <tr key={index}><td colSpan={5} className="p-4"><Skeleton className="h-12" /></td></tr>)
                    ) : history.data?.length ? history.data.map((item, index) => (
                      <tr key={item.id ?? index} className="hover:bg-surface-muted/70">
                        <td className="px-4 py-3 font-bold text-ink">{item.titulo ?? item.title ?? `Diagnóstico ${index + 1}`}</td>
                        <td className="px-4 py-3 text-muted">{item.resultado ?? item.result ?? item.recommendation ?? 'Resultado registrado.'}</td>
                        <td className="px-4 py-3"><Badge tone={riskTone(item.riskLevel ?? item.risco ?? item.status)}>{item.riskLevel ?? item.risco ?? item.status ?? 'Registrado'}</Badge></td>
                        <td className="px-4 py-3 text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          {item.id ? <Button variant="ghost" size="sm" onClick={() => window.open(agromindService.diagnosisReportUrl(selectedFieldId, item.id), '_blank', 'noopener,noreferrer')}><Download size={14} /> PDF</Button> : '-'}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-5"><EmptyState title="Sem diagnósticos" text="Execute um novo diagnóstico para popular o histórico deste talhão." /></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader title="Tendência técnica" eyebrow="Indicadores de apoio" />
              <div className="h-80 p-4">
                <ResponsiveContainer>
                  <AreaChart data={healthTrend}>
                    <CartesianGrid stroke="#e6ece3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="health" name="Saúde" stroke="#256f49" fill="#256f4922" strokeWidth={2} />
                    <Area type="monotone" dataKey="risk" name="Risco" stroke="#b42318" fill="#b4231822" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Evolução comparativa" eyebrow="Saúde, água e risco" />
            <div className="h-72 p-4">
              <ResponsiveContainer>
                <LineChart data={healthTrend}>
                  <CartesianGrid stroke="#e6ece3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line dataKey="health" name="Saúde" stroke="#256f49" strokeWidth={2} dot={false} />
                  <Line dataKey="water" name="Água" stroke="#256d8f" strokeWidth={2} dot={false} />
                  <Line dataKey="risk" name="Risco" stroke="#b42318" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      <Toast message={toast} tone={toastTone} onClose={() => setToast('')} />
    </div>
  )
}
