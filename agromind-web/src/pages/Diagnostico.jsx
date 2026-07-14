import { useCallback, useMemo, useState } from 'react'
import {
  Activity, ListChecks, Play, RefreshCw, ShieldAlert, Sprout, TriangleAlert
} from 'lucide-react'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Button, Select, EmptyState, Skeleton, Toast } from '../components/ui/Primitives'

// Nivel de risco real (RiskLevel do backend: Low/Medium/High/Critical) -> condicao exibida
const riskToCondition = {
  Low: 'Boa',
  Medium: 'Atenção',
  High: 'Crítica',
  Critical: 'Crítica',
}

const conditionMeta = {
  Boa:      { text: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  Atenção:  { text: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  Crítica:  { text: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  'Sem diagnóstico': { text: '#525252', bg: 'rgba(115,115,115,0.15)' },
}

// Pesos usados só pra render do gauge local — não e uma metrica vinda do backend.
const riskWeight = { Low: 100, Medium: 60, High: 30, Critical: 10 }

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

function ConditionDonut({ counts, total }) {
  const SEGMENTS = [
    { label: 'Boas condições',     key: 'boa',             color: '#22c55e' },
    { label: 'Atenção necessária', key: 'atencao',         color: '#f59e0b' },
    { label: 'Situação crítica',   key: 'critica',         color: '#ef4444' },
    { label: 'Sem diagnóstico',    key: 'semDiagnostico',  color: '#525252' },
  ]

  const gradient = useMemo(() => {
    if (!total) return 'conic-gradient(#1c1f1c 0deg 360deg)'
    let acc = 0
    const stops = SEGMENTS
      .map(s => ({ ...s, value: counts[s.key] ?? 0 }))
      .filter(s => s.value > 0)
      .map(s => {
        const start = (acc / total) * 360
        acc += s.value
        const end = (acc / total) * 360
        return `${s.color} ${start}deg ${end}deg`
      })
    return `conic-gradient(${stops.join(', ')})`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, counts.boa, counts.atencao, counts.critica, counts.semDiagnostico])

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-[#111311] text-center">
          <p className="text-2xl font-black text-white leading-none">{total}</p>
          <p className="text-[10px] text-[#737373] mt-0.5">Talhões</p>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {SEGMENTS.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 text-[#d4d4d4]">{s.label}</span>
            <span className="text-[#737373] font-mono">{counts[s.key] ?? 0} ({total ? Math.round(((counts[s.key] ?? 0) / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HealthGauge({ value, diagnosedCount }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-full max-w-[220px]">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="diagHealthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="55%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path d="M20,100 A80,80 0 0,1 180,100" pathLength="100" fill="none" stroke="#1c1f1c" strokeWidth="16" strokeLinecap="round" />
          <path d="M20,100 A80,80 0 0,1 180,100" pathLength="100" fill="none" stroke="url(#diagHealthGradient)" strokeWidth="16" strokeLinecap="round" />
          <line
            x1="100" y1="100"
            x2={100 + 68 * Math.cos(Math.PI - (value / 100) * Math.PI)}
            y2={100 - 68 * Math.sin(Math.PI - (value / 100) * Math.PI)}
            stroke="#e5e5e5" strokeWidth="2.5" strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="4.5" fill="#e5e5e5" />
        </svg>
        <div className="absolute bottom-0 inset-x-0 text-center">
          <p className="text-3xl font-black text-white leading-none">{value}<span className="text-xs text-[#525252] font-normal">/100</span></p>
          <p className="text-[11px] text-[#737373] font-semibold mt-1">Índice aproximado</p>
        </div>
      </div>
      <p className="text-[11px] text-[#737373] text-center mt-3 leading-snug max-w-[240px]">
        Calculado localmente a partir do nível de risco dos {diagnosedCount} talhões já diagnosticados — não é uma métrica do backend.
      </p>
    </div>
  )
}

export default function Diagnostico() {
  const farmsRequest = useAsync(() => agromindService.farms(), [])
  const [farmId, setFarmId] = useState('')
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('success')
  const [runningId, setRunningId] = useState('')

  // Monta a lista real de talhões + ultimo diagnostico de cada um.
  // TODO: mover isso para um endpoint agregado no backend (ex: GET /api/diagnosis/fields)
  // quando o numero de fazendas/talhoes crescer — hoje e N+1 chamadas.
  const loadRows = useCallback(async () => {
    const farms = farmsRequest.data ?? []
    const targetFarms = farmId ? farms.filter(f => f.id === farmId) : farms

    const rows = []
    for (const farm of targetFarms) {
      const fields = await agromindService.fields(farm.id)
      for (const field of fields) {
        const history = await agromindService.diagnosisHistory(field.id)
        const sorted = [...(history ?? [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        const latest = sorted[0] ?? null
        rows.push({
          fieldId: field.id,
          fieldNome: field.nome,
          farmId: farm.id,
          farmNome: farm.nome,
          latest: latest && {
            riskLevel: latest.riskLevel ?? latest.risco,
            confidence: latest.confidence ?? latest.confianca,
            recommendation: latest.recommendation ?? latest.resultado ?? latest.recomendacao,
            createdAt: latest.createdAt,
          },
        })
      }
    }
    return rows
  }, [farmsRequest.data, farmId])

  const rowsRequest = useAsync(loadRows, [farmsRequest.data, farmId])
  const rows = rowsRequest.data ?? []

  const counts = useMemo(() => {
    let boa = 0, atencao = 0, critica = 0, semDiagnostico = 0
    ;(rowsRequest.data ?? []).forEach(r => {
      if (!r.latest) { semDiagnostico++; return }
      const cond = riskToCondition[r.latest.riskLevel] ?? 'Sem diagnóstico'
      if (cond === 'Boa') boa++
      else if (cond === 'Atenção') atencao++
      else critica++
    })
    return { boa, atencao, critica, semDiagnostico, total: (rowsRequest.data ?? []).length }
  }, [rowsRequest.data])

  const diagnosedCount = counts.total - counts.semDiagnostico
  const gaugeValue = diagnosedCount
    ? Math.round(
        rows.reduce((sum, r) => sum + (r.latest ? riskWeight[r.latest.riskLevel] ?? 0 : 0), 0) / diagnosedCount
      )
    : 0

  const recentDiagnoses = useMemo(() => {
    return (rowsRequest.data ?? [])
      .filter(r => r.latest?.recommendation)
      .sort((a, b) => new Date(b.latest.createdAt) - new Date(a.latest.createdAt))
      .slice(0, 4)
  }, [rowsRequest.data])

  const runDiagnosis = async fieldId => {
    setRunningId(fieldId)
    try {
      await agromindService.createDiagnosis(fieldId)
      setToast('Diagnóstico executado.')
      setToastTone('success')
      await rowsRequest.refresh()
    } catch (err) {
      setToast(err.response?.data?.erro ?? 'Não foi possível executar o diagnóstico.')
      setToastTone('danger')
    } finally {
      setRunningId('')
    }
  }

  const loading = farmsRequest.loading || rowsRequest.loading

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ListChecks size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">Diagnósticos</h1>
            <p className="text-sm text-muted">Histórico de diagnósticos por talhão e execução de novas análises.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={farmId} onChange={event => setFarmId(event.target.value)} disabled={farmsRequest.loading || !farmsRequest.data?.length}>
            <option value="">Todas as fazendas</option>
            {(farmsRequest.data ?? []).map(farm => <option key={farm.id} value={farm.id}>{farm.nome}</option>)}
          </Select>
          <Button variant="secondary" onClick={rowsRequest.refresh}><RefreshCw size={16} /> Atualizar</Button>
        </div>
      </div>

      {!farmsRequest.loading && !farmsRequest.data?.length ? (
        <EmptyState icon={Sprout} title="Nenhuma fazenda cadastrada" text="Cadastre uma fazenda e seus talhões para executar diagnósticos." />
      ) : (
        <>
          {/* Cards de estatística */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Talhões analisados" value={counts.total} hint="no total" icon={Sprout} iconColor="#9ca3af" />
            <StatCard label="Condições boas" value={counts.boa} hint={counts.total ? `${Math.round((counts.boa / counts.total) * 100)}%` : '—'} icon={Activity} iconColor="#22c55e" />
            <StatCard label="Situação crítica" value={counts.critica} hint={counts.total ? `${Math.round((counts.critica / counts.total) * 100)}%` : '—'} icon={ShieldAlert} iconColor="#ef4444" />
            <StatCard label="Sem diagnóstico" value={counts.semDiagnostico} hint="ainda não analisados" icon={TriangleAlert} iconColor="#f59e0b" />
          </div>

          {/* Visao geral + Gauge */}
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-4">Visão geral das condições</h2>
              {loading ? <Skeleton className="h-32" /> : <ConditionDonut counts={counts} total={counts.total} />}
            </div>
            <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-2">Índice de saúde das lavouras</h2>
              {loading ? <Skeleton className="h-32" /> : <HealthGauge value={gaugeValue} diagnosedCount={diagnosedCount} />}
            </div>
          </div>

          {/* Diagnostico por lavoura + Diagnosticos recentes */}
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="bg-[#111311] border border-white/[0.03] rounded-xl overflow-hidden">
              <div className="p-4 pb-0">
                <h2 className="text-sm font-semibold text-white">Diagnóstico por lavoura</h2>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-[#737373]">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Talhão</th>
                      <th className="px-4 py-2.5 font-medium">Fazenda</th>
                      <th className="px-4 py-2.5 font-medium">Risco</th>
                      <th className="px-4 py-2.5 font-medium">Confiança</th>
                      <th className="px-4 py-2.5 font-medium">Última análise</th>
                      <th className="px-4 py-2.5 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {rowsRequest.error ? (
                      <tr>
                        <td colSpan={6} className="p-6">
                          <div className="flex flex-col items-center gap-3">
                            <p className="text-sm text-red-400">Erro ao carregar diagnósticos: {rowsRequest.error.message ?? 'Falha na requisição'}</p>
                            <div className="flex gap-2">
                              <Button onClick={() => rowsRequest.refresh()}>Tentar novamente</Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-9" /></td></tr>
                      ))
                    ) : rows.length ? rows.map(r => {
                      const cond = r.latest ? riskToCondition[r.latest.riskLevel] ?? 'Sem diagnóstico' : 'Sem diagnóstico'
                      const meta = conditionMeta[cond]
                      return (
                        <tr key={r.fieldId} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{r.fieldNome}</td>
                          <td className="px-4 py-3 text-[#a3a3a3] whitespace-nowrap">{r.farmNome}</td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-semibold rounded-full px-2.5 py-1" style={{ color: meta.text, backgroundColor: meta.bg }}>
                              {cond}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#d4d4d4] text-xs font-mono">
                            {r.latest ? `${Math.round(r.latest.confidence * 100)}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-[#737373] text-xs whitespace-nowrap">
                            {r.latest ? new Date(r.latest.createdAt).toLocaleDateString('pt-BR') : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => runDiagnosis(r.fieldId)}
                              disabled={runningId === r.fieldId}
                              className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center gap-1 ml-auto disabled:opacity-50"
                            >
                              <Play size={12} /> {runningId === r.fieldId ? 'Executando...' : 'Diagnosticar'}
                            </button>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={6} className="p-6"><EmptyState icon={Sprout} title="Nenhum talhão encontrado" text="Cadastre talhões nas suas fazendas para executar diagnósticos." /></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col">
              <h2 className="text-sm font-semibold text-white mb-3">Diagnósticos recentes</h2>
              {loading ? (
                <Skeleton className="h-40" />
              ) : recentDiagnoses.length ? (
                <div className="space-y-3">
                  {recentDiagnoses.map(r => (
                    <div key={r.fieldId} className="rounded-xl border border-white/[0.03] bg-[#161916] p-3">
                      <p className="text-xs font-bold text-white">{r.fieldNome} <span className="text-[#737373] font-normal">— {r.farmNome}</span></p>
                      <p className="text-[11px] text-[#a3a3a3] mt-1.5 leading-snug">{r.latest.recommendation}</p>
                      <p className="text-[10px] text-[#525252] mt-1.5 font-mono">{new Date(r.latest.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Sem diagnósticos recentes" text="Execute um diagnóstico em algum talhão para ver recomendações aqui." />
              )}
            </div>
          </div>
        </>
      )}

      <Toast message={toast} tone={toastTone} onClose={() => setToast('')} />
    </div>
  )
}