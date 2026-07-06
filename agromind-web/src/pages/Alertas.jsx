import { useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { MapContainer, Marker, Polygon, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle, Bell, Bug, Calendar, CheckCircle2, ChevronDown, ChevronRight,
  CloudRain, CloudSnow, FileText, FlaskConical, MoreHorizontal, RefreshCw, Settings2,
  ShieldOff, Snowflake, Sprout
} from 'lucide-react'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Button, Select, SearchBox, Skeleton, EmptyState, Toast } from '../components/ui/Primitives'

// ── Tipos reais do backend (AlertType) ───────────────────────────────────
const typeMeta = {
  Drought:   { label: 'Seca',           icon: FlaskConical, color: '#d97706' },
  Frost:     { label: 'Geada',          icon: Snowflake,    color: '#38bdf8' },
  HeavyRain: { label: 'Chuva Extrema',  icon: CloudRain,    color: '#0ea5e9' },
  LowPH:     { label: 'pH Baixo',       icon: FlaskConical, color: '#a78bfa' },
  Pest:      { label: 'Praga',          icon: Bug,          color: '#f97316' },
}

// SeverityLabel real do backend hoje só produz "Alta" (High/Critical viram "Alta" no handler).
// "Média"/"Baixa" existem no enum RiskLevel mas nenhuma regra do CalculateRiskService as gera ainda.
const severityMeta = {
  Alta:  { text: '#ef4444', bg: 'bg-red-500/10',    border: 'border-red-500/20' },
  Média: { text: '#f59e0b', bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  Baixa: { text: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

const statusMeta = {
  Ativo:    { text: '#ef4444', bg: 'bg-red-500/15' },
  Resolvido:{ text: '#22c55e', bg: 'bg-emerald-500/15' },
  Ignorado: { text: '#737373', bg: 'bg-white/10' },
}

const recommendations = [
  { icon: FlaskConical, color: '#d97706', title: 'Verifique a umidade do solo', text: 'Considere irrigação nas áreas com risco de seca.' },
  { icon: Bug, color: '#f97316', title: 'Monitore pragas', text: 'Aumente a frequência de monitoramento nas áreas de risco.' },
  { icon: CloudRain, color: '#0ea5e9', title: 'Prepare-se para chuva', text: 'Verifique drenagem antes de eventos de chuva extrema.' },
  { icon: Snowflake, color: '#38bdf8', title: 'Risco de geada', text: 'Avalie proteção das culturas mais sensíveis ao frio.' },
]

function formatDetectedAt(iso) {
  const date = new Date(iso)
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const day = date.toLocaleDateString('pt-BR')
  const isToday = new Date().toDateString() === date.toDateString()
  return `${isToday ? 'Hoje' : day}, ${time}\n${day}`
}

// ── Donut "Alertas por tipo" ─────────────────────────────────────────────
function TypeDonut({ data, total }) {
  const gradient = useMemo(() => {
    if (!total) return 'conic-gradient(#1c1f1c 0deg 360deg)'
    let acc = 0
    const stops = data.map(t => {
      const start = (acc / total) * 360
      acc += t.value
      const end = (acc / total) * 360
      return `${t.color} ${start}deg ${end}deg`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [data, total])

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-[#111311] text-center">
          <p className="text-xl font-black text-white leading-none">{total}</p>
          <p className="text-[10px] text-[#737373] mt-0.5">Total</p>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map(t => {
          const Icon = typeMeta[t.key]?.icon ?? AlertTriangle
          return (
            <div key={t.key} className="flex items-center gap-2 text-xs">
              <Icon size={13} style={{ color: t.color }} className="shrink-0" />
              <span className="flex-1 text-[#d4d4d4] truncate">{t.label}</span>
              <span className="text-[#737373] font-mono shrink-0">{t.value} ({Math.round((t.value / total) * 100)}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, hint, icon: Icon, iconColor }) {
  return (
    <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-[#a3a3a3]">{label}</p>
        <p className="mt-1.5 text-2xl font-extrabold text-white leading-none">{value}</p>
        <p className="mt-1 text-[11px] text-[#737373] truncate">{hint}</p>
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${iconColor}1a`, color: iconColor }}>
        <Icon size={20} />
      </div>
    </div>
  )
}

function RowMenu({ onResolve, onIgnore, busy }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 hover:text-white transition" onClick={() => setOpen(v => !v)} aria-label="Mais ações">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#161916] shadow-xl">
            <button disabled={busy} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#d4d4d4] hover:bg-white/5 disabled:opacity-50" onClick={() => { setOpen(false); onResolve() }}>
              <CheckCircle2 size={14} className="text-emerald-500" /> Marcar resolvido
            </button>
            <button disabled={busy} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#d4d4d4] hover:bg-white/5 disabled:opacity-50" onClick={() => { setOpen(false); onIgnore() }}>
              <ShieldOff size={14} className="text-[#737373]" /> Ignorar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Alertas() {
  const farmsRequest = useAsync(() => agromindService.farms(), [])
  const [farmId, setFarmId] = useState('')
  const [tipo, setTipo] = useState('')
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState('')
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('success')
  const pageSize = 5

  // Busca até 100 alertas (todos os status) com os filtros de fazenda/tipo aplicados no backend;
  // status e paginação da tabela ficam no cliente pra permitir trocar de aba sem refetch.
  // TODO: se o volume de alertas crescer muito, mover paginação/contagem por status pro backend.
  const request = useAsync(
    () => agromindService.alerts({ farmId: farmId || undefined, tipo: tipo || undefined, size: 100 }),
    [farmId, tipo],
  )

  const alerts = useMemo(() => request.data?.items ?? [], [request.data])

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      const text = `${a.tipoLabel} ${a.descricao} ${a.farmNome}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesTab =
        tab === 'all' ||
        (tab === 'active' && a.status === 'Active') ||
        (tab === 'attention' && a.status === 'Active' && a.severityLabel === 'Média') ||
        (tab === 'resolved' && a.status === 'Resolved')
      return matchesQuery && matchesTab
    })
  }, [alerts, query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  const counts = useMemo(() => ({
    ativos: alerts.filter(a => a.status === 'Active').length,
    atencao: alerts.filter(a => a.status === 'Active' && a.severityLabel === 'Média').length,
    resolvidos: alerts.filter(a => a.status === 'Resolved').length,
    total: alerts.length,
  }), [alerts])

  const typeData = useMemo(() => {
    const map = new Map()
    alerts.forEach(a => map.set(a.tipo, (map.get(a.tipo) ?? 0) + 1))
    return [...map.entries()]
      .map(([key, value]) => ({ key, value, label: typeMeta[key]?.label ?? key, color: typeMeta[key]?.color ?? '#9ca3af' }))
      .sort((a, b) => b.value - a.value)
  }, [alerts])

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

  const tabs = [
    { key: 'all', label: 'Todos' },
    { key: 'active', label: 'Ativos' },
    { key: 'attention', label: 'Atenção' },
    { key: 'resolved', label: 'Resolvidos' },
  ]

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">Alertas</h1>
            <p className="text-sm text-muted">Monitore e gerencie os alertas que exigem sua atenção nas fazendas.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={farmId} onChange={event => { setFarmId(event.target.value); setPage(1) }}>
            <option value="">Todas as fazendas</option>
            {(farmsRequest.data ?? []).map(farm => <option key={farm.id} value={farm.id}>{farm.nome}</option>)}
          </Select>
          <Select value={tipo} onChange={event => { setTipo(event.target.value); setPage(1) }}>
            <option value="">Todos os tipos</option>
            {Object.entries(typeMeta).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
          </Select>
          <Button variant="secondary" onClick={request.refresh}><RefreshCw size={16} /> Atualizar</Button>
        </div>
      </div>

      {/* Cards de estatística */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Alertas ativos" value={counts.ativos} hint="requerem atenção" icon={AlertTriangle} iconColor="#ef4444" />
        <StatCard label="Atenção" value={counts.atencao} hint="monitore de perto" icon={AlertTriangle} iconColor="#f59e0b" />
        <StatCard label="Resolvidos" value={counts.resolvidos} hint="alertas encerrados" icon={CheckCircle2} iconColor="#22c55e" />
        <StatCard label="Total" value={counts.total} hint="alertas carregados" icon={FileText} iconColor="#9ca3af" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        {/* Lista de alertas */}
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl overflow-hidden">
          <div className="p-4 pb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-white">Lista de alertas</h2>
              <SearchBox value={query} onChange={value => { setQuery(value); setPage(1) }} placeholder="Buscar alertas..." />
            </div>
            <div className="flex items-center gap-1 border-b border-white/[0.06] mt-3">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setPage(1) }}
                  className={`relative px-3.5 py-2.5 text-sm font-semibold transition ${tab === t.key ? 'text-[#22c55e]' : 'text-[#737373] hover:text-white'}`}
                >
                  {t.label}
                  {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#22c55e]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[#737373]">
                <tr>
                  <th className="px-4 py-3 font-medium">Alerta</th>
                  <th className="px-4 py-3 font-medium">Fazenda / Talhão</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Severidade</th>
                  <th className="px-4 py-3 font-medium">Detectado em</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {request.error ? (
                  <tr>
                    <td colSpan={7} className="p-6">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-red-400">Erro ao carregar alertas: {request.error.message ?? 'Falha na requisição'}</p>
                        <div className="flex gap-2">
                          <Button onClick={() => request.refresh()}>Tentar novamente</Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : request.loading ? (
                  Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7} className="p-4"><Skeleton className="h-10" /></td></tr>)
                ) : visible.length ? visible.map(a => {
                  const type = typeMeta[a.tipo] ?? { icon: AlertTriangle, color: '#9ca3af', label: a.tipoLabel }
                  const TypeIcon = type.icon
                  const sev = severityMeta[a.severityLabel] ?? severityMeta.Alta
                  const st = statusMeta[a.statusLabel] ?? statusMeta.Ativo
                  const isResolved = a.status === 'Resolved'
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          {isResolved
                            ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                            : <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: sev.text }} />}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{type.label}</p>
                            <p className="text-[11px] text-[#737373] mt-0.5 max-w-[220px] leading-snug">{a.descricao}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-xs font-medium">{a.farmNome}</p>
                        <p className="text-[11px] text-[#737373] mt-0.5">{a.fieldNome ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#d4d4d4]">
                          <TypeIcon size={13} style={{ color: type.color }} /> {type.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold rounded-full px-2.5 py-1" style={{ color: sev.text, backgroundColor: `${sev.text}1a` }}>
                          {a.severityLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#737373] font-mono whitespace-pre-line leading-snug">{formatDetectedAt(a.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold rounded-full px-2.5 py-1" style={{ color: st.text, backgroundColor: `${st.text}1a` }}>
                          {a.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <RowMenu
                            busy={busyId === `resolve-${a.id}` || busyId === `ignore-${a.id}`}
                            onResolve={() => runAction(a.id, 'resolve')}
                            onIgnore={() => runAction(a.id, 'ignore')}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={7} className="p-6"><EmptyState icon={Bell} title="Nenhum alerta encontrado" text="Ajuste os filtros ou aguarde novas ocorrências." /></td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <p className="text-xs text-[#737373]">Mostrando {visible.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + visible.length} de {filtered.length} alertas</p>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${page === i + 1 ? 'bg-[#22c55e] text-slate-950' : 'text-[#737373] hover:bg-white/5'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna lateral: donut (mapa removido por enquanto — ver nota abaixo) */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Alertas por tipo</h2>
            {typeData.length ? <TypeDonut data={typeData} total={counts.total} /> : <EmptyState title="Sem dados" text="Não há alertas para exibir." />}
          </div>
        </div>
      </div>

      {/* Recomendações rápidas */}
      <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sprout size={15} className="text-[#22c55e]" />
          <h3 className="text-sm font-semibold text-white">Recomendações rápidas</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {recommendations.map((rec, i) => {
            const Icon = rec.icon
            return (
              <div key={i} className="rounded-xl border border-white/[0.03] bg-[#161916] p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-2.5" style={{ backgroundColor: `${rec.color}22` }}>
                  <Icon size={15} style={{ color: rec.color }} />
                </div>
                <p className="text-sm font-bold text-white">{rec.title}</p>
                <p className="text-[11.5px] text-[#737373] mt-1 leading-snug">{rec.text}</p>
                <button className="text-[11.5px] font-semibold text-[#22c55e] mt-2 flex items-center hover:underline">
                  Ver recomendação <ChevronRight size={12} className="ml-0.5" />
                </button>
              </div>
            )
          })}
          <div className="rounded-xl border border-white/[0.03] bg-[#161916] p-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-2.5 bg-primary-soft text-primary">
              <Settings2 size={15} />
            </div>
            <p className="text-sm font-bold text-white">Configurar alertas</p>
            <p className="text-[11.5px] text-[#737373] mt-1 leading-snug">Personalize os tipos de alertas e receba notificações do que é importante para você.</p>
            <button className="text-[11.5px] font-semibold text-[#22c55e] mt-2 flex items-center hover:underline">
              Configurar alertas <ChevronRight size={12} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast} tone={toastTone} onClose={() => setToast('')} />
    </div>
  )
}