import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Leaf, Mail, UserRound } from 'lucide-react'
import api from '../services/api'
import { Button, Card, Field, Input } from '../components/ui/Primitives'

const schema = z.object({
  nome: z.string().min(3, 'Informe seu nome completo.'),
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(8, 'Use ao menos 8 caracteres.'),
  confirma: z.string(),
}).refine(values => values.senha === values.confirma, {
  path: ['confirma'],
  message: 'As senhas não coincidem.',
})

export default function Register() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: zodResolver(schema) })

  const submit = async values => {
    try {
      await api.post('/auth/register', { nome: values.nome, email: values.email, senha: values.senha, role: 0 })
      navigate('/login')
    } catch (err) {
      setError('root', { message: err.response?.data?.erro ?? 'Não foi possível criar a conta.' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-5">
      <Card className="w-full max-w-lg p-6 md:p-8">
        <div className="mb-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary"><Leaf size={22} /></div>
          <h1 className="text-2xl font-extrabold text-ink">Criar conta</h1>
          <p className="mt-2 text-sm text-muted">Cadastre um usuário para acessar a plataforma AgroMind.</p>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <Field label="Nome completo" error={errors.nome?.message}>
            <div className="relative"><UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><Input className="pl-9" {...register('nome')} /></div>
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><Input className="pl-9" {...register('email')} /></div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Senha" error={errors.senha?.message}><Input type="password" {...register('senha')} /></Field>
            <Field label="Confirmar senha" error={errors.confirma?.message}><Input type="password" {...register('confirma')} /></Field>
          </div>
          {errors.root?.message && <div className="rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{errors.root.message}</div>}
          <Button type="submit" className="w-full" loading={isSubmitting}>Criar conta</Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Já tem conta? <Link to="/login" className="font-semibold text-primary">Entrar</Link>
        </p>
      </Card>
    </div>
  )
}
