import { useRef, useState } from 'react'
import { Bot, Send, UserRound } from 'lucide-react'
import { aiService } from '../services/ai'
import { Button, Card, EmptyState, Input, Toast } from '../components/ui/Primitives'

const initialMessages = [
  { role: 'assistant', content: 'Olá. Posso apoiar decisões sobre clima, manejo, solo, pragas e operação agrícola.' },
]

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const bottomRef = useRef(null)

  const send = async event => {
    event.preventDefault()
    const text = message.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setMessage('')
    setLoading(true)

    try {
      const response = await aiService.chat({ message: text, history: nextMessages.slice(-10) })
      setMessages(current => [...current, { role: 'assistant', content: response.reply }])
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
    } catch {
      setToast('Não foi possível consultar o assistente agora.')
      setMessages(current => [...current, { role: 'assistant', content: 'A consulta falhou. Tente novamente em instantes.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-112px)] flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-primary">Assistente operacional</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">Consultoria agrícola</h1>
        <p className="mt-1 text-sm text-muted">Converse com o serviço de IA conectado ao backend do AgroMind.</p>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length ? (
            <div className="space-y-4">
              {messages.map((item, index) => {
                const isUser = item.role === 'user'
                const Icon = isUser ? UserRound : Bot
                return (
                  <div key={`${item.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[840px] gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-primary text-white' : 'bg-primary-soft text-primary'}`}>
                        <Icon size={17} />
                      </div>
                      <div className={`rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm ${isUser ? 'border-primary/20 bg-primary text-white' : 'border-border bg-white text-ink'}`}>
                        <p className="whitespace-pre-wrap">{item.content}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {loading && <div className="text-sm text-muted">Consultando serviço de IA...</div>}
              <div ref={bottomRef} />
            </div>
          ) : (
            <EmptyState icon={Bot} title="Conversa vazia" text="Envie uma pergunta para iniciar a análise." />
          )}
        </div>

        <form onSubmit={send} className="grid grid-cols-[1fr_auto] gap-2 border-t border-border p-4">
          <Input value={message} onChange={event => setMessage(event.target.value)} placeholder="Digite sua pergunta agrícola" />
          <Button type="submit" disabled={!message.trim()} loading={loading}><Send size={16} /> Enviar</Button>
        </form>
      </Card>

      <Toast message={toast} tone="danger" onClose={() => setToast('')} />
    </div>
  )
}
