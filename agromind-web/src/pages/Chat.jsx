import { useRef, useState } from 'react'
import {
  Bot, Bug, Calendar, Check, CheckCheck, Clock, Cloud, CloudDrizzle, CloudRain,
  Copy, Droplet, FileText, History, Leaf, Paperclip, Send, Sun, ThumbsDown, ThumbsUp, TriangleAlert, Wheat
} from 'lucide-react'
import { aiService } from '../services/ai'
import { Toast } from '../components/ui/Primitives'

// TODO: essa conversa inicial é só um seed visual pra bater com a referência.
// Troque por histórico real vindo de aiService.history() quando existir.
const seedMessages = [
  {
    id: 1, role: 'user', time: '08:45',
    text: 'Quais áreas da Fazenda Santa Clara estão com maior risco de pragas hoje?',
  },
  {
    id: 2, role: 'assistant', time: '08:45',
    intro: 'Analisando os dados da Fazenda Santa Clara, identifiquei que 2 áreas apresentam risco alto de pragas no momento:',
    riskList: [
      { field: 'Talhão 12 - Soja', area: '12,4 ha', pest: 'Lagarta', level: 'Risco alto (nível 3/3)', cond: 'Umidade alta + Temperatura ideal' },
      { field: 'Talhão 7 - Milho', area: '8,7 ha', pest: 'Percevejo', level: 'Risco alto (nível 3/3)', cond: 'Umidade média + Vento baixo' },
    ],
    outro: 'Recomendo monitoramento intensificado nessas áreas e possível aplicação preventiva nas próximas 48h.',
    withFeedback: true,
  },
  {
    id: 3, role: 'user', time: '08:46',
    text: 'Qual a previsão de chuva para os próximos 7 dias?',
  },
  {
    id: 4, role: 'assistant', time: '08:46',
    intro: 'Para os próximos 7 dias na região da Fazenda Santa Clara:',
    weather: {
      days: [
        { day: 'Hoje', date: '23/06', icon: CloudRain, color: 'text-blue-400', rain: 18 },
        { day: 'Ter', date: '24/06', icon: CloudRain, color: 'text-blue-400', rain: 32 },
        { day: 'Qua', date: '25/06', icon: Cloud, color: 'text-[#9ca3af]', rain: 5 },
        { day: 'Qui', date: '26/06', icon: Sun, color: 'text-amber-400', rain: 0 },
        { day: 'Sex', date: '27/06', icon: Sun, color: 'text-amber-400', rain: 0 },
        { day: 'Sáb', date: '28/06', icon: CloudDrizzle, color: 'text-blue-400', rain: 12 },
        { day: 'Dom', date: '29/06', icon: CloudRain, color: 'text-blue-400', rain: 25 },
      ],
      total: 92,
      peak: 'Terça-feira (32mm)',
    },
  },
]

const quickActions = [
  { icon: Bug, color: '#f97316', title: 'Analisar risco de pragas', desc: 'Análise de áreas vulneráveis', prompt: 'Analise o risco de pragas nas minhas áreas.' },
  { icon: CloudRain, color: '#38bdf8', title: 'Previsão do tempo', desc: 'Condições dos próximos dias', prompt: 'Qual a previsão do tempo para os próximos dias?' },
  { icon: Leaf, color: '#22c55e', title: 'Recomendações', desc: 'Sugestões personalizadas', prompt: 'Quais recomendações você tem para minhas lavouras agora?' },
  { icon: FileText, color: '#f59e0b', title: 'Relatórios', desc: 'Gerar relatórios de análise', prompt: 'Gere um relatório de análise das minhas fazendas.' },
]

const suggestions = [
  { icon: TriangleAlert, color: '#ef4444', title: 'Monitorar áreas de risco', desc: '3 áreas com risco alto de pragas precisam de atenção esta semana.', cta: 'Ver áreas' },
  { icon: Calendar, color: '#38bdf8', title: 'Janela ideal para plantio', desc: 'Condições climáticas favoráveis para plantio de milho nos próximos 5 dias.', cta: 'Ver janela' },
  { icon: Droplet, color: '#38bdf8', title: 'Irrigação recomendada', desc: '2 talhões precisam de irrigação nas próximas 24h baseado na umidade do solo.', cta: 'Ver talhões' },
]

function WeatherMini({ weather }) {
  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {weather.days.map((d, i) => {
          const Icon = d.icon
          return (
            <div key={i} className="rounded-lg border border-white/[0.05] bg-[#161916] p-2 text-center">
              <p className="text-[11px] font-semibold text-white">{d.day}</p>
              <p className="text-[9px] text-[#525252] font-mono">{d.date}</p>
              <div className="my-1.5 flex justify-center"><Icon size={18} className={d.color} /></div>
              <p className="text-[10px] text-[#737373]">{d.rain}mm</p>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[#a3a3a3] mt-3">Total previsto: <span className="font-semibold text-white">{weather.total}mm</span></p>
      <p className="text-xs text-[#a3a3a3] mt-0.5">Maior volume esperado: <span className="font-semibold text-white">{weather.peak}</span></p>
    </div>
  )
}

function AssistantBubble({ msg }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]">
        <Bot size={16} />
      </div>
      <div className="max-w-[720px] flex-1">
        <div className="rounded-xl border border-white/[0.04] bg-[#111311] px-4 py-3.5">
          {msg.intro && <p className="text-sm text-[#e5e5e5] leading-relaxed">{msg.intro}</p>}

          {msg.riskList && (
            <ol className="mt-3 space-y-3 list-decimal list-inside">
              {msg.riskList.map((item, i) => (
                <li key={i} className="text-sm text-[#e5e5e5]">
                  <span className="font-bold text-white">{item.field}</span> <span className="text-[#a3a3a3]">({item.area})</span>
                  <ul className="mt-1 ml-5 list-disc space-y-0.5 text-xs text-[#a3a3a3]">
                    <li><span className="text-[#e5e5e5] font-medium">{item.pest}:</span> {item.level}</li>
                    <li>Condições favoráveis: {item.cond}</li>
                  </ul>
                </li>
              ))}
            </ol>
          )}

          {msg.weather && <WeatherMini weather={msg.weather} />}

          {msg.outro && <p className="text-sm text-[#e5e5e5] leading-relaxed mt-3">{msg.outro}</p>}

          <p className="text-[11px] text-[#525252] font-mono text-right mt-2">{msg.time}</p>
        </div>

        {msg.withFeedback && (
          <div className="flex items-center gap-1.5 mt-2 pl-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 hover:text-white transition"><ThumbsUp size={14} /></button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 hover:text-white transition"><ThumbsDown size={14} /></button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 hover:text-white transition"><Copy size={14} /></button>
            <button className="ml-1 flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-[#a3a3a3] hover:bg-white/5 transition">
              <FileText size={13} /> Fontes dos dados
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function UserBubble({ msg }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[600px] rounded-xl bg-[#1c3a24] border border-[#22c55e]/20 px-4 py-3">
        <p className="text-sm text-[#e5e5e5] leading-relaxed">{msg.text}</p>
        <div className="flex items-center justify-end gap-1 mt-1.5">
          <span className="text-[11px] text-[#7f9c86] font-mono">{msg.time}</span>
          <CheckCheck size={13} className="text-[#22c55e]" />
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState(seedMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const bottomRef = useRef(null)

  const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const sendText = async text => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = { id: Date.now(), role: 'user', time: now(), text: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.chat({ message: trimmed, history: next.slice(-10) })
      setMessages(current => [...current, { id: Date.now() + 1, role: 'assistant', time: now(), intro: response.reply }])
    } catch {
      setToast('Não foi possível consultar o assistente agora.')
      setMessages(current => [...current, { id: Date.now() + 1, role: 'assistant', time: now(), intro: 'A consulta falhou. Tente novamente em instantes.' }])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
    }
  }

  const submit = event => {
    event.preventDefault()
    sendText(input)
  }

  return (
<div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">Assistente com IA</h1>
            <p className="text-sm text-muted">Seu especialista agrícola inteligente.</p>
            <p className="text-sm text-muted">Faça perguntas, obtenha análises e recomendações personalizadas para suas fazendas.</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 self-start rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-[#d4d4d4] hover:bg-white/5 transition sm:self-auto">
          <History size={15} /> Histórico de conversas
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px] xl:items-start">
        {/* Coluna do chat */}
        <div className="flex flex-col rounded-xl border border-white/[0.03] bg-[#0d0f0d] h-[min(78vh,720px)] min-h-[480px]">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <p className="text-center text-xs text-[#525252]">Hoje</p>
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' ? <UserBubble msg={msg} /> : <AssistantBubble msg={msg} />}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#737373] pl-11">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" /> Consultando dados da fazenda...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="border-t border-white/[0.04] p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111311] px-3 py-2">
              <button type="button" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 transition" aria-label="Anexar arquivo">
                <Paperclip size={16} />
              </button>
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder="Digite sua pergunta sobre suas fazendas..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#525252] outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#22c55e] text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16a34a] transition"
                aria-label="Enviar"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-center text-[11px] text-[#525252] mt-2.5">O Assistente pode cometer erros. Sempre confirme informações críticas.</p>
          </form>
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Ações rápidas</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <button
                    key={i}
                    onClick={() => sendText(action.prompt)}
                    className="text-left rounded-xl border border-white/[0.04] bg-[#161916] p-3 hover:border-white/10 hover:bg-[#1a1d1a] transition"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${action.color}22` }}>
                      <Icon size={14} style={{ color: action.color }} />
                    </div>
                    <p className="text-xs font-bold text-white leading-tight">{action.title}</p>
                    <p className="text-[10.5px] text-[#737373] mt-1 leading-snug">{action.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Sugestões para você</h2>
            <div className="space-y-2.5">
              {suggestions.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="rounded-xl border border-white/[0.04] bg-[#161916] p-3 flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}22` }}>
                      <Icon size={15} style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{s.title}</p>
                      <p className="text-[10.5px] text-[#737373] mt-0.5 leading-snug">{s.desc}</p>
                    </div>
                    <button className="shrink-0 self-center rounded-lg border border-[#22c55e]/25 px-2.5 py-1.5 text-[10.5px] font-semibold text-[#22c55e] hover:bg-[#22c55e]/10 transition whitespace-nowrap">
                      {s.cta}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#111311] border border-white/[0.03] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Contexto atual</h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Wheat size={15} className="text-[#22c55e] shrink-0" />
                <div>
                  <p className="text-[#737373] leading-none">Fazenda selecionada</p>
                  <p className="text-white font-semibold mt-1">Fazenda Santa Clara</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Leaf size={15} className="text-[#22c55e] shrink-0" />
                <div>
                  <p className="text-[#737373] leading-none">Culturas ativas</p>
                  <p className="text-white font-semibold mt-1">Soja, Milho</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={15} className="text-[#38bdf8] shrink-0" />
                <div>
                  <p className="text-[#737373] leading-none">Última atualização</p>
                  <p className="text-white font-semibold mt-1">23/06/2026, 08:40</p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-3 flex items-start gap-2.5">
              <Check size={15} className="text-[#22c55e] mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#22c55e]">Dados atualizados em tempo real</p>
                <p className="text-[10.5px] text-[#a3a3a3] mt-0.5 leading-snug">Todas as análises são baseadas nos dados mais recentes das suas fazendas.</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#22c55e] shrink-0 mt-1" />
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast} tone="danger" onClose={() => setToast('')} />
    </div>
  )
}