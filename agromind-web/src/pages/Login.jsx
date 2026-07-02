import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { BarChart3, CloudSun, Eye, EyeOff, Leaf, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { Button, Card, Field, Input } from '../components/ui/Primitives'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const submit = async values => {
    setError('')
    setLoading(true)
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.erro ?? 'E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80')] bg-cover bg-center lg:block">
        <div className="flex h-full flex-col justify-between bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-transparent p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/15 backdrop-blur"><Leaf size={20} /></div>
            <div><p className="font-extrabold">AgroMind AI</p><p className="text-xs text-white/70">Plataforma agrícola corporativa</p></div>
          </div>
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold leading-tight">Operação agrícola orientada por dados.</h1>
            <p className="mt-4 text-base leading-7 text-white/75">Monitore propriedades, clima, alertas e diagnósticos em um ambiente projetado para equipes técnicas e gestores.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[['GIS', Leaf], ['Clima', CloudSun], ['Analytics', BarChart3]].map(([label, Icon]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"><Icon size={18} /><p className="mt-3 text-sm font-bold">{label}</p></div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50">© 2026 AgroMind.</p>
        </div>
      </section>

      <main className="flex items-center justify-center p-5">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary"><ShieldCheck size={22} /></div>
            <h2 className="text-2xl font-extrabold text-ink">Entrar</h2>
            <p className="mt-2 text-sm text-muted">Acesse o painel operacional da sua organização.</p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <Field label="E-mail" error={errors.email?.message}>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input className="pl-9" {...register('email')} placeholder="você@empresa.com" />
              </div>
            </Field>
            <Field label="Senha" error={errors.password?.message}>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input className="pl-9 pr-10" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Sua senha" />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && <div className="rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</div>}

            <Button type="submit" className="w-full" loading={loading}>Entrar</Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary-strong">Esqueci a senha</Link>
            <Link to="/register" className="font-semibold text-primary hover:text-primary-strong">Criar conta</Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
