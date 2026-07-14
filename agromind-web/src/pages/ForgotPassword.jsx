import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, CheckCircle2, Leaf, Lock, Mail, Send, Shield, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { Button, Field, Input } from '../components/ui/Primitives'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
})

// CENA DE RECUPERAÇÃO: Fazendeiro confuso tentando lembrar o token de criptografia (100% Fullscreen)
function AgroTechForgotBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#040805" />
            <stop offset="40%" stopColor="#0b110d" />
            <stop offset="100%" stopColor="#050a06" />
          </linearGradient>
          <linearGradient id="alertWaves" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffb84d" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffb84d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tokenHologram" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffb84d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#66c8ff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Fundo Base Escuro */}
        <rect width="800" height="900" fill="url(#skyGrad)" />

        {/* Linhas de Grade de Satélite Distorcidas / Desconectadas */}
        <g opacity="0.05" stroke="#ffb84d" strokeWidth="1">
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={`g-${i}`} cx="400" cy="450" r={100 + i * 90} fill="none" strokeDasharray="5 10" />
          ))}
          <line x1="0" y1="450" x2="800" y2="450" />
          <line x1="400" y1="0" x2="400" y2="900" />
        </g>

        {/* Horizonte do Terreno Agrícola */}
        <path d="M-100,700 Q300,670 550,710 T950,690 L950,900 L-100,900 Z" fill="#08120a" />

        {/* 1. OPERADOR COÇANDO A CABEÇA (Tentando lembrar o Token) */}
        <g transform="translate(180, 520)">
          {/* Corpo e Jaqueta Tech */}
          <path d="M40,90 L80,90 L90,160 L30,160 Z" fill="#18241c" stroke="#25382b" strokeWidth="2" />
          
          {/* Braço Direito Dobrado subindo até a nuca (Gesto de esquecimento/confusão) */}
          <path d="M75,105 L102,75 L92,62 L78,88" fill="#18241c" stroke="#25382b" strokeWidth="2" />
          <circle cx="95" cy="62" r="6" fill="#1c3823" /> {/* Mão na nuca */}

          {/* Cabeça inclinada levemente para cima olhando o holograma */}
          <circle cx="55" cy="62" r="13" fill="#1c3823" />
          
          {/* Chapéu de abas largas inclinado ligeiramente para trás */}
          <path d="M25,48 L85,50 L95,58 L15,58 Z" fill="#2d4a36" />
          <path d="M35,48 Q55,20 75,49 Z" fill="#18241c" />

          {/* Expressão do Óculos HUD piscando em alerta amarelo */}
          <rect x="42" y="58" width="16" height="5" fill="#ffb84d" rx="1" opacity="0.8" />
        </g>

        {/* 2. GLOW DO HOLOGRAMA DE DADOS PERDIDOS */}
        <polygon points="190,580 430,320 570,320" fill="url(#tokenHologram)" opacity="0.6" />

        {/* Ponto de Interrogação e Linhas de Token Incompleto (Estilo Sci-Fi) */}
        <g transform="translate(480, 260)">
          {/* Círculo do Holograma Principal */}
          <circle cx="20" cy="20" r="50" fill="none" stroke="#ffb84d" strokeWidth="1.5" strokeDasharray="4 4" style={{ animation: 'spin 20s linear infinite' }} />
          
          {/* Ícone de Interrogação Tecnológico Embutido */}
          <text x="-2" y="42" fill="#ffb84d" fontSize="68" fontWeight="900" fontFamily="sans-serif" filter="drop-shadow(0px 0px 12px rgba(255,184,77,0.6))" style={{ animation: 'pulse 2s infinite' }}>?</text>
          
          {/* Código de Chave "Criptografada / Bloqueada" */}
          <text x="-55" y="95" fill="#fff" opacity="0.4" fontSize="11" fontFamily="monospace" tracking="2">TOKEN: * * * * * *</text>
          <text x="-55" y="112" fill="#ff6b6b" opacity="0.8" fontSize="9" fontStyle="italic" fontFamily="sans-serif">Chave de Telemetria Expirada</text>
        </g>

        {/* 3. DRONE EM MODO DE ESPERA (Flutuando estático aguardando sinal) */}
        <g style={{ animation: 'droneHoverLoss 4s ease-in-out infinite' }}>
          {/* Sinalizador de Link Caído (Feixe apontando para o trator/solo) */}
          <polygon points="560,510 520,700 600,700" fill="url(#alertWaves)" />

          {/* Chassi do Drone */}
          <rect x="525" y="490" width="70" height="15" fill="#1f2421" rx="4" stroke="#ffb84d" strokeWidth="1" />
          <line x1="490" y1="497" x2="630" y2="497" stroke="#2c332f" strokeWidth="3" />
          
          {/* Hélices girando bem devagar (Standby) */}
          <ellipse cx="490" cy="495" rx="18" ry="1.5" fill="#fff" opacity="0.15" />
          <ellipse cx="630" cy="495" rx="18" ry="1.5" fill="#fff" opacity="0.15" />

          {/* LED indicador piscando em Laranja/Aviso */}
          <circle cx="560" cy="497" r="3.5" fill="#ffb84d" style={{ animation: 'pulse 0.6s infinite' }} />
        </g>
      </svg>

      <style>{`
        @keyframes droneHoverLoss {
          0%, 100% { transform: translateY(0) rotate(1deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const submit = async values => {
    await new Promise(r => setTimeout(r, 1200))
    setSentEmail(values.email)
    setSent(true)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_480px] bg-[#060b08] font-sans antialiased text-white selection:bg-primary/30">

      {/* ── Seção Esquerda Integrada (Design de Recuperação de Parâmetros) ── */}
      <section className="relative hidden lg:flex flex-col justify-between p-16 overflow-hidden border-r border-white/[0.03]">
        
        {/* Renderização do Cenário de Token Esquecido */}
        <AgroTechForgotBackground />

        {/* Brand / Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
            <Leaf size={16} className="text-primary"/>
          </div>
          <div>
            <p className="font-bold tracking-tight text-white">AgroMind</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Enterprise Ecosystem</p>
          </div>
        </div>

        {/* Copy de Suporte Contextual */}
        <div className="relative z-10 my-auto max-w-lg space-y-4 bg-gradient-to-r from-[#040805]/95 via-[#040805]/40 to-transparent p-6 rounded-2xl backdrop-blur-[2px]">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <KeyRound size={12} strokeWidth={2.5} />
            Chave de Autenticação Requerida
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1]">
            Esqueceu a senha <br />
            <span style={{
              background: 'linear-gradient(135deg, #ffb84d, #66c8ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>ou o token do ativo?</span>
          </h1>
          <p className="text-base text-white/60 max-w-sm font-medium leading-relaxed">
            Sem problemas. Segurança faz parte do ciclo. Informe seu e-mail corporativo cadastrado para restaurar as credenciais da frota de forma segura.
          </p>
        </div>

        {/* Linha de Rodapé - Central de Ajuda Direta */}
        <div className="relative z-10 flex items-center justify-between text-xs font-medium border-t border-white/[0.05] pt-4 text-white/40">
          <p>Precisa de suporte urgente? <span className="text-primary font-semibold">suporte@agromind.com.br</span></p>
          <p>© 2026</p>
        </div>
      </section>

      {/* ── Seção Direita (Painel Interativo de Recuperação) ── */}
      <main className="relative flex items-center justify-center p-6 bg-[#090e0b] perspective-[1000px]">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-white/[0.06] bg-[#0d130f]/85 backdrop-blur-xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">

            {/* Ícone Dinâmico com Feedback visual */}
            <div className="mb-6 flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-[0_0_30px_rgba(79,226,136,0.05)]">
                {sent ? (
                  <CheckCircle2 size={34} className="text-primary" style={{ animation: 'scaleIn .4s ease both' }} />
                ) : (
                  <>
                    <Lock size={30} className="text-primary/70"/>
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg border border-[#0d130f] bg-primary">
                      <Leaf size={12} className="text-slate-950"/>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!sent ? (
              <>
                <div className="mb-6 text-center space-y-1.5">
                  <h2 className="text-xl font-bold tracking-tight text-white">Recuperar acesso</h2>
                  <p className="text-xs text-white/50">Insira seu e-mail para validar a redefinição de chave.</p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="space-y-4">
                  <Field label="E-mail corporativo cadastrado" error={errors.email?.message}>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <Input className="pl-11 h-11 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 text-sm transition-all rounded-xl w-full text-white placeholder:text-white/20" {...register('email')} placeholder="nome@empresa.com" />
                    </div>
                  </Field>

                  <Button type="submit" className="w-full h-11 text-sm font-bold bg-primary text-[#050a06] rounded-xl hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(79,226,136,0.3)] transition-all flex items-center justify-center gap-2">
                    <Send size={14}/> Enviar Chave de Recuperação
                  </Button>
                </form>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.06]"/>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">ou</span>
                  <div className="h-px flex-1 bg-white/[0.06]"/>
                </div>

                <Link to="/login" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.01] text-xs font-bold text-white/70 transition-all hover:bg-white/[0.04] hover:text-white">
                  <ArrowLeft size={14}/> Voltar ao painel de login
                </Link>

                <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary/[0.04] border border-primary/10 p-3.5">
                  <Shield size={16} className="mt-0.5 shrink-0 text-primary"/>
                  <div>
                    <p className="text-xs font-bold text-white">Protocolo de Segurança Ativo</p>
                    <p className="mt-0.5 text-[11px] text-white/50 leading-relaxed">Sua conta utiliza arquitetura integrada. O link enviado expirará de forma autônoma em 15 minutos.</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4" style={{ animation: 'scaleIn .4s ease both' }}>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold tracking-tight text-white">Instruções enviadas! ✉️</h2>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Um link de redefinição foi despachado com sucesso para o endereço profissional:<br/>
                    <strong className="text-white font-semibold">{sentEmail}</strong>.
                  </p>
                </div>
                
                <Link to="/login" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[#050a06] text-sm font-bold shadow-[0_8px_24px_rgba(79,226,136,0.25)] transition-all hover:bg-primary/90">
                  <ArrowLeft size={14}/> Retornar para Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}