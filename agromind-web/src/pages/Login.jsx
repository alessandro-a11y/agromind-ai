import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { Button, Field, Input } from '../components/ui/Primitives'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const submit = async values => {
    setAuthError('')
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      setAuthError(err.response?.data?.erro ?? 'E-mail ou senha inválidos.')
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_480px] bg-canvas font-sans antialiased text-ink selection:bg-primary/30">
      
      {/* ── Seção Esquerda ── */}
      <section className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0a0e0b] via-[#0f1410] to-[#0a0e0b]">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 25% 50%, #4fe288 0%, transparent 50%), radial-gradient(circle at 75% 50%, #66c8ff 0%, transparent 50%)`
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary/[0.02] to-transparent" />
        
        {/* Logo */}
        <div className="relative">
          <Logo size={36} />
        </div>

        <div className="relative max-w-lg space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-ink leading-[1.15]">
            A inteligência de dados {' '}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              aplicada ao campo.
            </span>
          </h1>
          <p className="text-base text-muted leading-relaxed">
            Acompanhe sua produção de ponta a ponta com monitoramento de precisão, 
            análises climáticas e automação inteligente.
          </p>
          
          <div className="flex items-center gap-6 pt-4">
            {[
              { value: '12+', label: 'Fazendas monitoradas' },
              { value: '99%', label: 'Uptime garantido' },
              { value: '24/7', label: 'Suporte técnico' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-lg font-extrabold text-primary">{s.value}</p>
                <p className="text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-muted font-medium">
          <p>© 2026 AgroMind Systems.</p>
          <p>Todos os direitos reservados.</p>
        </div>
      </section>

      {/* ── Seção Direita ── */}
      <main className="flex items-center justify-center p-6 bg-surface">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-sm space-y-6">
          {/* Cabeçalho do formulário */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Logo size={40} variant="icon" className="text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-ink">Acesse sua conta</h2>
            <p className="text-sm text-muted">Insira seu e-mail e senha para continuar.</p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <Field label="E-mail" error={errors.email?.message}>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input 
                  className="pl-10 h-11" 
                  {...register('email')} 
                  placeholder="seu@email.com" 
                  autoComplete="email"
                />
              </div>
            </Field>

            <Field label="Senha" error={errors.password?.message}>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input 
                  className="pl-10 pr-10 h-11" 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')} 
                  placeholder="••••••••" 
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </Field>

            {authError && (
              <div className="rounded-lg bg-danger-soft border border-danger/20 px-3.5 py-2.5 text-xs font-semibold text-danger">
                {authError}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11" 
              loading={isSubmitting}
            >
              Entrar no sistema
            </Button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2">
            <Link to="/forgot-password" className="font-semibold text-muted hover:text-ink transition-colors">
              Esqueceu a senha?
            </Link>
            <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Criar conta
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}