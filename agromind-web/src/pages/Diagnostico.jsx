import { useMemo, useState } from 'react'
import {
  Bug, Calendar, ChevronRight, Droplet, Leaf, ListChecks,
  RefreshCw, ShieldAlert, Sprout, ThermometerSun, TriangleAlert
} from 'lucide-react'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Button, Select, EmptyState, Skeleton, Toast } from '../components/ui/Primitives'

// ── Meta de condição/severidade ─────────────────────────────────────────
const conditionMeta = {
  Boa: { text: '#22c55e', bg: 'rgba(34,197,94,0.15)', barFrom: '#22c55e', barTo: '#22c55e' },
  Atenção: { text: '#f59e0b', bg: 'rgba(245,158,11,0.15)', barFrom: '#f59e0b', barTo: '#f59e0b' },
  Crítica: { text: '#ef4444', bg: 'rgba(239,68,68,0.15)', barFrom: '#ef4444', barTo: '#ef4444' },
}

const severityMeta = {
  Alta: { text: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  Média: { text: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  Baixa: { text: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
}

const issueIconMap = {
  nutricional: TriangleAlert,
  praga: Bug,
  hidrico: Droplet,
  doenca: TriangleAlert,
}

// TODO: substituir por endpoint agregado real, ex: agromindService.diagnosisSummary()
const fallbackIssues = [
  { id: 1, icon: 'nutricional', color: '#f59e0b', title: 'Deficiência nutricional', desc: 'Baixos níveis de Nitrogênio detectados em 2 áreas', afetadas: 2, severidade: 'Média' },
  { id: 2, icon: 'praga', color: '#ef4444', title: 'Pragas (Lagarta)', desc: 'Presença acima do nível de controle econômico em 1 área', afetadas: 1, severidade: 'Alta' },
  { id: 3, icon: 'hidrico', color: '#38bdf8', title: 'Estresse hídrico', desc: 'Baixa umidade do solo detectada em 2 áreas', afetadas: 2, severidade: 'Média' },
  { id: 4, icon: 'doenca', color: '#f59e0b', title: 'Risco de doenças', desc: 'Condições favoráveis ao desenvolvimento de doenças em 1 área', afetadas: 1, severidade: 'Média' },
]

// TODO: substituir por agromindService.fieldsDiagnosis() com Talhão, Fazenda, Cultura,
// healthIndex, condição e ícones de problema por lavoura.
const fallbackFieldDiagnoses = [
  { id: 1, talhao: 'Talhão 12 - Soja', farm: 'Fazenda Santa Clara', cultura: 'Soja', healthIndex: 85, condicao: 'Boa', problemIcons: ['leaf', 'bug', 'sun'], acoes: 2 },
  { id: 2, talhao: 'Talhão 7 - Milho', farm: 'Fazenda Boa Vista', cultura: 'Milho', healthIndex: 62, condicao: 'Atenção', problemIcons: ['warn', 'triangle', 'droplet'], acoes: 3 },
  { id: 3, talhao: 'Talhão 3 - Soja', farm: 'Fazenda São Miguel', cultura: 'Soja', healthIndex: 45, condicao: 'Crítica', problemIcons: ['droplet', 'warn', 'leaf'], acoes: 4 },
  { id: 4, talhao: 'Talhão 5 - Milho', farm: 'Fazenda Santa Clara', cultura: 'Milho', healthIndex: 78, condicao: 'Boa', problemIcons: ['bug', 'leaf', 'warn'], acoes: 2 },
  { id: 5, talhao: 'Talhão 3 - Soja', farm: 'Fazenda Horizonte', cultura: 'Soja', healthIndex: 38, condicao: 'Crítica', problemIcons: ['warn', 'droplet', 'bug'], acoes: 4 },
]

const problemIconMeta = {
  leaf: { icon: Leaf, color: '#22c55e' },
  bug: { icon: Bug, color: '#ef4444' },
  sun: { icon: ThermometerSun, color: '#f59e0b' },
  warn: { icon: TriangleAlert, color: '#f59e0b' },
  triangle: { icon: TriangleAlert, color: '#ef4444' },
  droplet: { icon: Droplet, color: '#38bdf8' },
}

const smartRecommendations = [
  { icon: Droplet, color: '#38bdf8', title: 'Irrigação recomendada', text: '2 áreas com estresse hídrico. Irrigação pode melhorar produtividade em até 15%.' },
  { icon: Leaf, color: '#22c55e', title: 'Adubação nitrogenada', text: 'Aplicação de N recomendada em 2 áreas para corrigir deficiência detectada.' },
  { icon: Bug, color: '#f59e0b', title: 'Controle de pragas', text: 'Monitoramento intensificado recomendado. Nível de lagartas acima do ideal em 1 área.' },
]

// ── Donut "Visão geral das condições" ────────────────────────────────────
function ConditionDonut({ counts, total }) {
  const segments = [
    { label: 'Boas condições', value: counts.boa, color: '#22c55e' },
    { label: 'Atenção necessária', value: counts.atencao, color: '#f59e0b' },
    { label: 'Situação crítica', value: counts.critica, color: '#ef4444' },
    { label: 'Sem dados', value: counts.semDados, color: '#525252' },
  ]

  const gradient = useMemo(() => {
    if (!total) return 'conic-gradient(#1c1f1c 0deg 360deg)'
    let acc = 0
    const stops = segments.filter(s => s.value > 0).map(s => {
      const start = (acc / total) * 360
      acc += s.value
      const end = (acc / total) * 360
      return `${s.color} ${start}deg ${end}deg`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [total, counts])

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-[#111311] text-center">
          <p className="text-2xl font-black text-white leading-none">{total}</p>
          <p className="text-[10px] text-[#737373] mt-0.5">Total</p>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 text-[#d4d4d4]">{s.label}</span>
            <span className="text-[#737373] font-mono">{s.value} ({total ? Math.round((s.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Gauge "Índice de saúde das lavouras" ─────────────────────────────────
function HealthGauge({ value, delta }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-full max-w-[220px]">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="diagHealthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="55%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M20,100 A80,80 0 0,1 180,100" pathLength="100" fill="none" stroke="#1c1f1c" strokeWidth="16" strokeLinecap="round" />
          <path d="M20,100 A80,80 0 0,1 180,100" pathLength="100" fill="none" stroke="url(#diagHealthGradient)" strokeWidth="16" strokeLinecap="round" />
          {/* Ponteiro proporcional ao valor (0–100 mapeado em 180°–0°) */}
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
          <p className="text-[11px] text-[#737373] font-semibold mt-1">Saúde geral</p>
        </div>
      </div>
      <p className="text-[11px] text-[#737373] text-center mt-3 leading-snug max-w-[220px]">
        Índice baseado em clima, solo, pragas, doenças e desenvolvimento da cultura.
      </p>
      <p className="text-[11px] text-[#22c55e] font-mono mt-1.5">↑ {delta} pontos em relação à semana anterior</p>
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

export default function Diagnostico() {
  const farms = useAsync(() => agromindService.farms(), [])
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('success')

  // TODO: trocar pelos endpoints reais quando existirem:
  // agromindService.diagnosisSummary(), agromindService.fieldsDiagnosis(), agromindService.smartRecommendations()
  const issues = fallbackIssues
  const fieldDiagnoses = fallbackFieldDiagnoses

  const counts = useMemo(() => {
    const boa = fieldDiagnoses.filter(f => f.condicao === 'Boa').length
    const atencao = fieldDiagnoses.filter(f => f.condicao === 'Atenção').length
    const critica = fieldDiagnoses.filter(f => f.condicao === 'Crítica').length
    const semDados = 0
    return { boa, atencao, critica, semDados, total: fieldDiagnoses.length }
  }, [fieldDiagnoses])

  const totalRecomendacoes = fieldDiagnoses.reduce((s, f) => s + f.acoes, 0)
  const avgHealth = Math.round(fieldDiagnoses.reduce((s, f) => s + f.healthIndex, 0) / Math.max(fieldDiagnoses.length, 1))

  const refresh = async () => {
    await farms.refresh()
    setToast('Diagnósticos atualizados.')
    setToastTone('success')
  }

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
            <p className="text-sm text-muted">Análises detalhadas das condições das suas lavouras e recomendações inteligentes.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value="" onChange={() => {}}>
            <option value="">Todas as fazendas</option>
            {(farms.data ?? []).map(farm => <option key={farm.id} value={farm.id}>{farm.nome}</option>)}
          </Select>
          <Select value="" onChange={() => {}}>
            <option value="">Todas as culturas</option>
            <option value="Soja">Soja</option>
            <option value="Milho">Milho</option>
            <option value="Trigo">Trigo</option>
          </Select>
          <Button variant="secondary" className="gap-1.5">
            <Calendar size={15} /> 23/06/2026 – 29/06/2026
          </Button>
          <span className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
            Atualizado há 8 min
            <button onClick={refresh} className="rounded-full p-1 hover:bg-surface-muted transition" aria-label="Atualizar">
              <RefreshCw size={13} />
            </button>
          </span>
        </div>
      </div>

      {/* Cards de estatística */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Áreas analisadas" value={counts.total} hint="lavouras" icon={Sprout} iconColor="#9ca3af" />
        <StatCard label="Condições boas" value={`${counts.boa}`} hint={`(${Math.round((counts.boa / counts.total) * 100)}%)`} icon={Leaf} iconColor="#22c55e" />
        <StatCard label="Atenção necessária" value={counts.atencao} hint={`(${Math.round((counts.atencao / counts.total) * 100)}%)`} icon={TriangleAlert} iconColor="#f59e0b" />
        <StatCard label="Situação crítica" value={counts.critica} hint={`(${Math.round((counts.critica / counts.total) * 100)}%)`} icon={ShieldAlert} iconColor="#ef4444" />
        <StatCard label="Recomendações ativas" value={totalRecomendacoes} hint="ações sugeridas" icon={Leaf} iconColor="#22c55e" />
      </div>

      {/* Visão geral + Problemas + Gauge */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Visão geral das condições</h2>
          <ConditionDonut counts={counts} total={counts.total} />
        </div>

        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-3">Principais problemas identificados</h2>
          <div className="space-y-2.5 flex-1">
            {issues.map(issue => {
              const Icon = issueIconMap[issue.icon] ?? TriangleAlert
              const sev = severityMeta[issue.severidade] ?? severityMeta.Média
              return (
                <div key={issue.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${issue.color}22` }}>
                    <Icon size={15} style={{ color: issue.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{issue.title}</p>
                    <p className="text-[11px] text-[#737373] mt-0.5 leading-snug">{issue.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[#525252]">Áreas afetadas</p>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      <span className="text-sm font-bold text-white">{issue.afetadas}</span>
                      <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ color: sev.text, backgroundColor: sev.bg }}>
                        {issue.severidade}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="text-xs font-semibold text-[#22c55e] mt-3 flex items-center hover:underline">
            Ver todos os problemas <ChevronRight size={14} className="ml-0.5" />
          </button>
        </div>

        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-2">Índice de saúde das lavouras</h2>
          <HealthGauge value={avgHealth} delta={8} />
        </div>
      </div>

      {/* Diagnóstico por lavoura + Recomendações inteligentes */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="bg-[#111311] border border-white/[0.03] rounded-xl overflow-hidden">
          <div className="p-4 pb-0">
            <h2 className="text-sm font-semibold text-white">Diagnóstico por lavoura</h2>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-[#737373]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Lavoura</th>
                  <th className="px-4 py-2.5 font-medium">Fazenda</th>
                  <th className="px-4 py-2.5 font-medium">Cultura</th>
                  <th className="px-4 py-2.5 font-medium">Índice de saúde</th>
                  <th className="px-4 py-2.5 font-medium">Condição</th>
                  <th className="px-4 py-2.5 font-medium">Principais problemas</th>
                  <th className="px-4 py-2.5 font-medium">Ações recomendadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {farms.loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="p-4"><Skeleton className="h-9" /></td></tr>
                  ))
                ) : fieldDiagnoses.length ? fieldDiagnoses.map(f => {
                  const cond = conditionMeta[f.condicao] ?? conditionMeta.Boa
                  return (
                    <tr key={f.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{f.talhao}</td>
                      <td className="px-4 py-3 text-[#a3a3a3] whitespace-nowrap">{f.farm}</td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{f.cultura}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${f.healthIndex}%`, backgroundColor: cond.barFrom }} />
                          </div>
                          <span className="text-xs font-mono text-[#d4d4d4] shrink-0">{f.healthIndex}/100</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold rounded-full px-2.5 py-1" style={{ color: cond.text, backgroundColor: cond.bg }}>
                          {f.condicao}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {f.problemIcons.map((key, idx) => {
                            const meta = problemIconMeta[key]
                            const Icon = meta.icon
                            return <Icon key={idx} size={13} style={{ color: meta.color }} />
                          })}
                          <span className="text-[11px] text-[#737373] ml-0.5">{f.problemIcons.length}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center gap-0.5">
                          Ver ações <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={7} className="p-6"><EmptyState icon={Sprout} title="Nenhum diagnóstico disponível" text="Execute diagnósticos para ver os resultados aqui." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3">
            <button className="text-xs font-semibold text-[#22c55e] flex items-center hover:underline">
              Ver todas as lavouras <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>
        </div>

        <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4 flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-3">Recomendações inteligentes</h2>
          <div className="space-y-3 flex-1">
            {smartRecommendations.map((rec, i) => {
              const Icon = rec.icon
              return (
                <div key={i} className="rounded-xl border border-white/[0.03] bg-[#161916] p-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${rec.color}22` }}>
                      <Icon size={15} style={{ color: rec.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{rec.title}</p>
                      <p className="text-[11px] text-[#737373] mt-1 leading-snug">{rec.text}</p>
                      <button className="text-[11px] font-semibold text-[#22c55e] mt-2 flex items-center hover:underline">
                        Ver detalhes <ChevronRight size={12} className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="text-xs font-semibold text-[#22c55e] mt-3 flex items-center hover:underline">
            Ver todas as recomendações <ChevronRight size={14} className="ml-0.5" />
          </button>
        </div>
      </div>

      <Toast message={toast} tone={toastTone} onClose={() => setToast('')} />
    </div>
  )
}