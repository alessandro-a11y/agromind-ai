import { useMemo, useState } from 'react'
import { Bot, Send, UserRound } from 'lucide-react'
import { aiService } from '../services/ai'

const initialMessages = [
  {
    role: 'assistant',
    content: 'Olá. Posso ajudar com manejo, solo, clima, pragas e recomendações agrícolas.',
  },
]

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const history = useMemo(
    () => messages.map(item => ({ role: item.role, content: item.content })),
    [messages],
  )

  const send = async event => {
    event.preventDefault()
    const text = message.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setMessage('')
    setLoading(true)

    try {
      const response = await aiService.chat({
        message: text,
        history: nextMessages.slice(-10),
      })

      setMessages(current => [
        ...current,
        { role: 'assistant', content: response.reply },
      ])
    } catch {
      setMessages(current => [
        ...current,
        { role: 'assistant', content: 'Não consegui consultar a IA agora. Tente novamente em instantes.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-scroll" style={{ display:'flex', flexDirection:'column', height:'100vh', padding:16, gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:8, background:'#2d4f3a', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Bot size={20} style={{ color:'#6aab7a' }} />
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'var(--color-brand-text)', margin:0 }}>Assistente IA</h1>
          <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>Consultoria agrícola conectada ao AgroMind.</p>
        </div>
      </div>

      <section style={{ flex:1, minHeight:0, overflowY:'auto', border:'1px solid var(--color-brand-border)', borderRadius:8, background:'var(--color-brand-surface)', padding:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {messages.map((item, index) => {
            const isUser = item.role === 'user'
            const Icon = isUser ? UserRound : Bot

            return (
              <div key={`${item.role}-${index}`} style={{ display:'flex', justifyContent:isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, maxWidth:'min(720px, 85%)', flexDirection:isUser ? 'row-reverse' : 'row' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:isUser ? 'var(--color-brand-green)' : '#2d4f3a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={15} style={{ color:'#fff' }} />
                  </div>
                  <p style={{ margin:0, padding:'10px 12px', borderRadius:8, border:'1px solid var(--color-brand-border)', color:'var(--color-brand-text)', background:isUser ? 'rgba(74,124,89,0.18)' : 'var(--color-brand-bg)', fontSize:14, lineHeight:1.55, whiteSpace:'pre-wrap' }}>
                    {item.content}
                  </p>
                </div>
              </div>
            )
          })}
          {loading && (
            <div style={{ fontSize:13, color:'var(--color-brand-muted)' }}>
              Consultando IA...
            </div>
          )}
        </div>
      </section>

      <form onSubmit={send} style={{ display:'grid', gridTemplateColumns:'1fr 44px', gap:8 }}>
        <input
          value={message}
          onChange={event => setMessage(event.target.value)}
          placeholder="Digite sua pergunta agrícola"
          style={{ height:44, borderRadius:8, border:'1px solid var(--color-brand-border)', background:'var(--color-brand-surface)', color:'var(--color-brand-text)', padding:'0 12px', outline:'none' }}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          title="Enviar"
          style={{ width:44, height:44, borderRadius:8, border:'none', background:'var(--color-brand-green)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', opacity:loading || !message.trim() ? 0.55 : 1, cursor:loading || !message.trim() ? 'not-allowed' : 'pointer' }}
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
