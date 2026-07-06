import { useRef, useState } from 'react'
import {
  Bot, Bug, Calendar, Check, CheckCheck, Clock, CloudRain, Copy, Droplet,
  FileText, History, Leaf, Paperclip, Send, ThumbsDown, ThumbsUp, TriangleAlert, Wheat
} from 'lucide-react'
import { aiService } from '../services/ai'
import { Toast } from '../components/ui/Primitives'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  time: '',
  intro: 'Olá! Sou o assistente do AgroMind. Posso analisar risco de pragas, previsão do tempo, recomendações e gerar relatórios sobre suas fazendas. O que você gostaria de saber?',
}

const quickActions = [
  { icon: Bug, color: '#f97316', title: 'Analisar risco de pragas', desc: 'Análise de áreas vulneráveis', prompt: 'Analise o risco de pragas nas minhas áreas.' },
  { icon: CloudRain, color: '#38bdf8', title: 'Previsão do tempo', desc: 'Condições dos próximos dias', prompt: 'Qual a previsão do tempo para os próximos dias?' },
  { icon: Leaf, color: '#22c55e', title: 'Recomendações', desc: 'Sugestões personalizadas', prompt: 'Quais recomendações você tem para minhas lavouras agora?' },
  { icon: FileText, color: '#f59e0b', title: 'Relatórios', desc: 'Gerar relatórios de análise', prompt: 'Gere um relatório de análise das minhas fazendas.' },
]

const suggestions = [
  { icon: TriangleAlert, color: '#ef4444', title: 'Monitorar áreas de risco', desc: 'Veja quais áreas têm alertas ativos que precisam de atenção.', cta: 'Ver áreas' },
  { icon: Calendar, color: '#38bdf8', title: 'Janela ideal para plantio', desc: 'Consulte condições climáticas favoráveis para plantio.', cta: 'Ver janela' },
  { icon: Droplet, color: '#38bdf8', title: 'Irrigação recomendada', desc: 'Veja talhões que podem precisar de irrigação.', cta: 'Ver talhões' },
]

function AssistantBubble({ msg }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]">
        <Bot size={16} />
      </div>
      <div className="max-w-[720px] flex-1">
        <div className="rounded-xl border border-white/[0.04] bg-[#111311] px-4 py-3.5">
          <p className="text-sm text-[#e5e5e5] leading-relaxed whitespace-pre-wrap">{msg.intro}</p>
          {msg.time && <p className="text-[11px] text-[#525252] font-mono text-right mt-2">{msg.time}</p>}
        </div>

        {msg.id !== 'welcome' && (
          <div className="flex items-center gap-1.5 mt-2 pl-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 hover:text-white transition"><ThumbsUp size={14} /></button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 hover:text-white transition"><ThumbsDown size={14} /></button>
            <button
              onClick={() => navigator.clipboard?.writeText(msg.intro ?? '')}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#737373] hover:bg-white/5 hover:text-white transition"
            >
              <Copy size={14} />
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
  const [messages, setMessages] = useState([welcomeMessage])
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

        {/* Coluna lateral (inalterada) */}
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
        </div>
      </div>

      <Toast message={toast} tone="danger" onClose={() => setToast('')} />
    </div>
  )
}