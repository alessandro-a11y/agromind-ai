import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Mail, ShieldCheck } from 'lucide-react'
import { Button, Card, Field, Input } from '../components/ui/Primitives'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
})

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: zodResolver(schema) })

  const submit = async () => {
    setError('root', { message: 'Recuperação de senha ainda não possui endpoint no backend atual.' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-5">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="mb-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-info-soft text-info"><ShieldCheck size={22} /></div>
          <h1 className="text-2xl font-extrabold text-ink">Recuperar senha</h1>
          <p className="mt-2 text-sm text-muted">O frontend está preparado, mas o backend atual não expõe endpoint de recuperação.</p>
        </div>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <Field label="E-mail" error={errors.email?.message}>
            <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><Input className="pl-9" {...register('email')} placeholder="você@empresa.com" /></div>
          </Field>
          {errors.root?.message && <div className="rounded-md bg-warning-soft px-3 py-2 text-sm font-medium text-warning">{errors.root.message}</div>}
          <Button type="submit" className="w-full" loading={isSubmitting}>Verificar disponibilidade</Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Lembrou a senha? <Link to="/login" className="font-semibold text-primary">Voltar ao login</Link>
        </p>
      </Card>
    </div>
  )
}
