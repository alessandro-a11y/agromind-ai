import { useMemo, useRef, useState } from 'react'
import {
  Bot, Bug, Calendar, CheckCheck, Clock, CloudRain, Copy, Droplet,
  FileText, History, Leaf, Paperclip, Send, ThumbsDown, ThumbsUp, TriangleAlert, Wheat
} from 'lucide-react'
import { aiService } from '../services/ai'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { Toast } from '../components/ui/Primitives'

// Formato padronizado: { role, content, time? }
function normalizeMessages(messages) {
  return messages.map(m => ({
    role: m.role,
    content: m.content ?? m.intro ?? m.text ?? '',
    time: m.time ?? '',
  }))
}

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Olá! Sou o assistente do AgroMind. Posso analisar risco de pragas, previsão do tempo, recomendações e gerar relatórios sobre suas fazendas. O que você gostaria de saber?',
  time: '',
}

const quickActions = [
  { icon: Bug, color: '#f97316', title: 'Analisar risco de pragas', desc: 'Análise de áreas vulneráveis', prompt: 'Analise o risco de pragas nas minhas áreas.' },
  { icon: CloudRain, color: '#38bdf8', title: 'Previsão do tempo', desc: 'Condições dos próximos dias', prompt: 'Qual a previsão do tempo para os próximos dias?' },
  { icon: Leaf, color: '#22c55e', title: 'Recomendações', desc: 'Sugestões personalizadas', prompt: 'Quais recomendações você tem para minhas lavouras agora?' },
  { icon: FileText, color: '#f59e0b', title: 'Relatórios', desc: 'Gerar relatórios de análise', prompt: 'Gere um relatório de análise das minhas fazendas.' },
]

function AssistantBubble({ msg, onRetry }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary-soft text-primary">
        <Bot size={16} />
      </div>
      <div className="max-w-[720px] flex-1">
        <div className="rounded-xl border border-white/5 bg-surface px-4 py-3.5">
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          {msg.time && <p className="text-[11px] text-muted font-mono text-right mt-2">{msg.time}</p>}
        </div>

        {msg.id !== 'welcome' && (
          <div className="flex items-center gap-1.5 mt-2 pl-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-ink transition"><ThumbsUp size={14} /></button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-ink transition"><ThumbsDown size={14} /></button>
            <button
              onClick={() => navigator.clipboard?.writeText(msg.content ?? '')}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-ink transition"
            >
              <Copy size={14} />
            </button>
            {msg.retry && onRetry && (
              <button className="ml-2 rounded-xl bg-danger px-3 py-1 text-xs font-semibold text-white" onClick={() => onRetry(msg.retryText)}>Tentar novamente</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function UserBubble({ msg }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[600px] rounded-xl bg-primary-soft border border-primary/20 px-4 py-3">
        <p className="text-sm text-ink leading-relaxed">{msg.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1.5">
          <span className="text-[11px] text-muted font-mono">{msg.time}</span>
          <CheckCheck size={13} className="text-primary" />
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
  const lastUserRef = useRef(null)

  // Carrega fazendas para contexto
  const farmsRequest = useAsync(() => agromindService.farms(), [])
  const farms = farmsRequest.data ?? []

  // Monta resumo das fazendas para contexto do sistema
  const farmContext = useMemo(() => {
    if (!farms.length) return null
    return farms.map(f => ({
      id: f.id,
      nome: f.nome,
      cidade: f.cidade,
      estado: f.estado,
      latitude: f.latitude,
      longitude: f.longitude,
      areaHa: f.areaHa ?? null,
      cultura: f.cultura ?? null,
      safra: f.safra ?? null,
      activeAlerts: f.activeAlerts ?? 0,
      healthIndex: f.healthIndex ?? null,
    }))
  }, [farms])

  const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const sendText = async text => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    // Normaliza mensagens já existentes para o formato { role, content }
    const normalizedMessages = normalizeMessages(messages)
    const userMsg = { role: 'user', content: trimmed, time: now() }
    const next = [...normalizedMessages, userMsg]
    setMessages(current => [...current, { id: Date.now(), role: 'user', content: trimmed, time: now() }])
    setInput('')
    setLoading(true)
    lastUserRef.current = trimmed

    try {
      const response = await aiService.chat({
        message: trimmed,
        history: next.slice(-16).map(m => ({ role: m.role, content: m.content })),
        farmContext: farmContext ? JSON.stringify(farmContext) : undefined,
      })
      setMessages(current => [...current, { id: Date.now() + 1, role: 'assistant', content: response.reply, time: now() }])
    } catch {
      setToast('Não foi possível consultar o assistente agora.')
      setMessages(current => [...current, { id: Date.now() + 1, role: 'assistant', content: 'A consulta falhou. Tente novamente em instantes.', time: now(), retry: true, retryText: lastUserRef.current }])
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary-soft text-primary">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">Assistente com IA</h1>
            <p className="text-sm text-muted">Seu especialista agrícola inteligente.</p>
            <p className="text-sm text-muted">Faça perguntas, obtenha análises e recomendações personalizadas para suas fazendas.</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 self-start rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-muted hover:bg-white/5 transition sm:self-auto">
          <History size={15} /> Histórico de conversas
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px] xl:items-start">
        {/* Coluna do chat */}
        <div className="flex flex-col rounded-xl border border-white/5 bg-surface h-[min(78vh,720px)] min-h-[480px]">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {messages.map(msg => (
              <div key={msg.id ?? msg.time}>
                {msg.role === 'user' ? <UserBubble msg={msg} /> : <AssistantBubble msg={msg} />}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted pl-11">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Consultando dados da fazenda...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="border-t border-white/5 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-muted px-3 py-2">
              <button type="button" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-white/5 transition" aria-label="Anexar arquivo">
                <Paperclip size={16} />
              </button>
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder="Digite sua pergunta sobre suas fazendas..."
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted/50 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-strong transition"
                aria-label="Enviar"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-center text-[11px] text-muted mt-2.5">
              {farms.length > 0 
                ? `${farms.length} fazenda(s) disponíveis para consulta.`
                : 'O Assistente pode cometer erros. Sempre confirme informações críticas.'}
            </p>
          </form>
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-white/5 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-ink mb-3">Ações rápidas</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <button
                    key={i}
                    onClick={() => sendText(action.prompt)}
                    className="text-left rounded-xl border border-white/5 bg-surface-muted p-3 hover:border-white/10 hover:bg-surface transition"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${action.color}22` }}>
                      <Icon size={14} style={{ color: action.color }} />
                    </div>
                    <p className="text-xs font-bold text-ink leading-tight">{action.title}</p>
                    <p className="text-[10.5px] text-muted mt-1 leading-snug">{action.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {farms.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-ink mb-3">Fazendas disponíveis</h2>
              <div className="space-y-2">
                {farms.slice(0, 5).map(farm => (
                  <div key={farm.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-muted">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Leaf size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink truncate">{farm.nome}</p>
                      <p className="text-[10px] text-muted truncate">{farm.cidade}, {farm.estado}</p>
                    </div>
                  </div>
                ))}
                {farms.length > 5 && (
                  <p className="text-[10px] text-muted text-center">+{farms.length - 5} outras fazendas</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toast} tone="danger" onClose={() => setToast('')} />
    </div>
  )
}