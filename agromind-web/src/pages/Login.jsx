import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { Leaf, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-brand-bg)' }}>
      {/* Painel esquerdo — identidade */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16"
           style={{ background: 'var(--color-brand-surface)', borderRight: '1px solid var(--color-brand-border)' }}>
        <div className="flex items-center gap-3">
          <Leaf size={22} style={{ color: 'var(--color-brand-green-light)' }} />
          <span className="text-lg font-semibold tracking-wide" style={{ color: 'var(--color-brand-text)' }}>
            AgroMind
          </span>
        </div>
        <div>
          <p className="text-5xl font-light leading-tight mb-6" style={{ color: 'var(--color-brand-text)' }}>
            Inteligência<br />
            <span style={{ color: 'var(--color-brand-green-light)' }}>para o campo.</span>
          </p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-brand-muted)' }}>
            Monitoramento climático, análise de risco e diagnóstico agronômico
            em tempo real para sua operação.
          </p>
        </div>
        <div className="flex gap-8">
          {[['Fazendas', 'monitoradas'], ['Alertas', 'em tempo real'], ['Culturas', 'suportadas']].map(([n, l]) => (
            <div key={n}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-brand-muted)' }}>{n}</p>
              <p className="text-sm" style={{ color: 'var(--color-brand-amber-light)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Leaf size={20} style={{ color: 'var(--color-brand-green-light)' }} />
            <span className="font-semibold" style={{ color: 'var(--color-brand-text)' }}>AgroMind</span>
          </div>

          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-brand-text)' }}>
            Entrar
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-brand-muted)' }}>
            Acesse sua conta para continuar
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider"
                     style={{ color: 'var(--color-brand-muted)' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-brand-surface)',
                  border: '1px solid var(--color-brand-border)',
                  color: 'var(--color-brand-text)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-brand-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-brand-border)'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider"
                     style={{ color: 'var(--color-brand-muted)' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-brand-surface)',
                  border: '1px solid var(--color-brand-border)',
                  color: 'var(--color-brand-text)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-brand-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-brand-border)'}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                   style={{ background: '#2a1a1a', border: '1px solid #5a2a2a', color: '#f87171' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all mt-2"
              style={{
                background: loading ? 'var(--color-brand-border)' : 'var(--color-brand-green)',
                color: loading ? 'var(--color-brand-muted)' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
