import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Eye, EyeOff, Leaf, Lock, Mail, UserRound, Cpu } from 'lucide-react'
import { useState } from 'react'
import api from '../services/api'
import { Button, Field, Input } from '../components/ui/Primitives'

const schema = z.object({
  nome:     z.string().min(3, 'Informe seu nome completo.'),
  email:    z.string().email('Informe um e-mail válido.'),
  senha:    z.string().min(8, 'Use ao menos 8 caracteres.'),
  confirma: z.string(),
}).refine(v => v.senha === v.confirma, { path: ['confirma'], message: 'As senhas não coincidem.' })

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let s = 0
  if (pwd.length >= 8)           s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return [
    { score:0, label:'',       color:'' },
    { score:1, label:'Fraca',  color:'#ff6b6b' },
    { score:2, label:'Média',  color:'#ffbb5c' },
    { score:3, label:'Boa',    color:'#66c8ff' },
    { score:4, label:'Forte',  color:'#4fe288' },
  ][s]
}

// CENA DE ONBOARDING: Operador configurando o ecossistema (100% Fullscreen na Esquerda)
function AgroTechOnboardingBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#040805" />
            <stop offset="40%" stopColor="#07120a" />
            <stop offset="100%" stopColor="#050a06" />
          </linearGradient>
          <linearGradient id="signalWaves" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4fe288" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#66c8ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="uiBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#111c14" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#080f0a" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Fundo Base */}
        <rect width="800" height="900" fill="url(#skyGrad)" />

        {/* HUD de Configuração / Linhas de Conectividade */}
        <g opacity="0.15">
          <circle cx="250" cy="520" r="180" fill="none" stroke="#4fe288" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="250" cy="520" r="280" fill="none" stroke="#66c8ff" strokeWidth="1" />
          {/* Linhas de pareamento de dados */}
          <line x1="250" y1="520" x2="140" y2="640" stroke="#4fe288" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="250" y1="520" x2="550" y2="430" stroke="#66c8ff" strokeWidth="2" strokeDasharray="4 4" />
        </g>

        {/* Solo e Linhas de Campo */}
        <path d="M-100,680 Q250,640 500,670 T900,660 L900,900 L-100,900 Z" fill="#060c08" opacity="0.7" />
        <rect x="-100" y="700" width="1000" height="210" fill="#09140d" />

        {/* Cultivos em crescimento (Simbolizando início de conta) */}
        <g fill="#3cb36b" opacity="0.6" style={{ transformOrigin: 'bottom', animation: 'subtleWind 6s ease-in-out infinite' }}>
          {[50, 120, 280, 350, 480, 600, 720].map((x, i) => (
            <circle key={`sprout-${i}`} cx={x} cy={740 + (i % 3) * 15} r="4" />
          ))}
        </g>

        {/* 1. O FAZENDEIRO / OPERADOR TÉCNICO (Controlando e Registrando os Ativos) */}
        <g transform="translate(200, 450)">
          {/* Corpo/Silhueta Tech */}
          <path d="M35,90 L65,90 L72,150 L28,150 Z" fill="#132618" stroke="#22442b" strokeWidth="2" />
          {/* Chapéu de Fazendeiro Clássico estilizado em vetor plano */}
          <path d="M25,50 L75,50 L85,58 L15,58 Z" fill="#1b3d24" />
          <path d="M32,50 Q50,25 68,50 Z" fill="#132618" />
          {/* Cabeça e Óculos de Interface AR */}
          <circle cx="50" cy="66" r="11" fill="#1c3823" />
          <rect x="42" y="62" width="18" height="5" fill="#4fe288" rx="1" style={{ animation: 'pulse 1.5s infinite' }} />
          {/* Tablet de Configuração de Hardware (Glow de dados) */}
          <rect x="52" y="92" width="34" height="22" fill="#090e0b" stroke="#66c8ff" strokeWidth="1.5" rx="3" transform="rotate(-15 52 92)" />
          <line x1="62" y1="96" x2="82" y2="91" stroke="#4fe288" strokeWidth="1.5" transform="rotate(-15 52 92)" />
          {/* Efeito de feixe de sincronização saindo do tablet */}
          <polygon points="75,90 120,-10 500,-20" fill="url(#signalWaves)" opacity="0.3" />
        </g>

        {/* 2. DRONE SENDO CONFIGURADO (Em fase de calibração de altitude) */}
        <g style={{ animation: 'droneSetup 5s ease-in-out infinite' }}>
          {/* Linhas guia de calibração laser */}
          <line x1="550" y1="430" x2="550" y2="700" stroke="#66c8ff" strokeWidth="1" strokeDasharray="3 8" opacity="0.5" />
          
          {/* Estrutura do Drone */}
          <rect x="515" y="415" width="70" height="14" fill="#161f19" rx="5" stroke="#223328" strokeWidth="1.5" />
          <circle cx="550" cy="422" r="6" fill="#66c8ff" />
          {/* Motores e Hélices */}
          <path d="M500,418 L530,418" stroke="#333" strokeWidth="3" />
          <path d="M570,418 L600,418" stroke="#333" strokeWidth="3" />
          <ellipse cx="495" cy="418" rx="22" ry="2" fill="#fff" opacity="0.25" />
          <ellipse cx="605" cy="418" rx="22" ry="2" fill="#fff" opacity="0.25" />
          
          {/* Painel Flutuante UI (Status do Pareamento do Drone) */}
          <g transform="translate(590, 350)" opacity="0.85">
            <rect width="110" height="42" fill="url(#uiBoxGrad)" stroke="#66c8ff" strokeWidth="1" rx="6" />
            <text x="10" y="16" fill="#66c8ff" fontSize="9" fontWeight="bold" fontFamily="monospace">DRONE_CALIB</text>
            <text x="10" y="30" fill="#fff" fontSize="10" fontFamily="sans-serif">ONLINE 100%</text>
            <circle cx="95" cy="13" r="3" fill="#4fe288" />
          </g>
        </g>

        {/* 3. TRATOR SENDO VINCULADO À CONTA (Aguardando Registro) */}
        <g transform="translate(-40, 60)">
          {/* Caixa de diálogo UI de registro do maquinário */}
          <g transform="translate(110, 500)">
            <rect width="130" height="46" fill="url(#uiBoxGrad)" stroke="#4fe288" strokeWidth="1" rx="6" />
            <text x="12" y="18" fill="#4fe288" fontSize="9" fontWeight="bold" fontFamily="monospace">REG_TRACTOR_V4</text>
            <text x="12" y="34" fill="#fff" fontSize="10" fontFamily="sans-serif">AGUARDANDO ID...</text>
            <circle cx="112" cy="15" r="3" fill="#ffb84d" style={{ animation: 'pulse 1s infinite' }} />
          </g>

          {/* Maquinário pesado estático/ajustando sensores */}
          <g transform="translate(110, 570)">
            <rect x="30" y="20" width="95" height="42" fill="#16291b" rx="8" stroke="#25472f" strokeWidth="2" />
            <rect x="42" y="5" width="55" height="16" fill="#0b140e" rx="4" />
            {/* Sensor LIDAR no teto piscando */}
            <polygon points="70,5 60,-15 80,-15" fill="url(#signalWaves)" opacity="0.2" />
            <circle cx="70" cy="2" r="2.5" fill="#4fe288" />

            {/* Rodas grandes de suporte */}
            <circle cx="52" cy="62" r="22" fill="#111" stroke="#222" strokeWidth="3" />
            <circle cx="52" cy="62" r="10" fill="#242b26" />
            <circle cx="105" cy="64" r="18" fill="#111" stroke="#222" strokeWidth="2" />
            <circle cx="105" cy="64" r="8" fill="#242b26" />
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes droneSetup {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(5px); }
        }
        @keyframes subtleWind {
          0%, 100% { transform: skewX(0deg); }
          50% { transform: skewX(3deg); }
        }
      `}</style>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [showP, setShowP] = useState(false)
  const [showC, setShowC] = useState(false)
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setError } = useForm({ resolver: zodResolver(schema) })
  const senhaValue = useWatch({ control, name: 'senha', defaultValue: '' })
  const strength = getStrength(senhaValue)

  const submit = async values => {
    try {
      await api.post('/auth/register', { nome: values.nome, email: values.email, senha: values.senha, role: 0 })
      navigate('/login')
    } catch (err) {
      setError('root', { message: err.response?.data?.erro ?? 'Não foi possível criar a conta.' })
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_520px] bg-[#060b08] font-sans antialiased text-white selection:bg-primary/30">

      {/* ── Seção Esquerda Integrada (Design de Onboarding de Ativos) ── */}
      <section className="relative hidden lg:flex flex-col justify-between p-16 overflow-hidden border-r border-white/[0.03]">
        
        {/* Renderização da Fazenda de Integração e Setup Técnico */}
        <AgroTechOnboardingBackground />

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

        {/* Copy de Onboarding Direto */}
        <div className="relative z-10 my-auto max-w-lg space-y-4 bg-gradient-to-r from-[#040805]/95 via-[#040805]/40 to-transparent p-6 rounded-2xl backdrop-blur-[2px]">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Cpu size={12} strokeWidth={2.5} />
            Configuração do Ecossistema
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1]">
            Conecte sua frota <br />
            <span style={{
              background: 'linear-gradient(135deg, #4fe288, #66c8ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>e mude o seu jogo.</span>
          </h1>
          <p className="text-base text-white/60 max-w-sm font-medium leading-relaxed">
            Cadastre sua conta corporativa para integrar tratores autônomos, telemetria de drones e sensores inteligentes em um só lugar.
          </p>
        </div>

        {/* Footer Legal */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/30 font-medium">
          <p>© 2026 AgroMind Systems.</p>
          <p>v4.2.1-prod</p>
        </div>
      </section>

      {/* ── Seção Direita (Formulário de Registro de Usuário) ── */}
      <main className="relative flex items-center justify-center overflow-y-auto p-6 bg-[#090e0b] perspective-[1000px]">

        <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-primary" style={{ animation: 'pulse 2.5s ease-in-out infinite' }}/>
          <span className="text-xs font-semibold text-primary">Sistema online</span>
        </div>

        <div className="w-full max-w-sm py-12">
          <div className="rounded-3xl border border-white/[0.06] bg-[#0d130f]/85 backdrop-blur-xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">

            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-[0_0_30px_rgba(79,226,136,0.05)]">
                <UserRound size={32} className="text-primary"/>
              </div>
            </div>

            <div className="mb-6 text-center space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-white">Criar conta corporativa</h2>
              <p className="text-xs text-white/50">Preencha os dados de operador para iniciar o setup</p>
            </div>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <Field label="Nome completo" error={errors.nome?.message}>
                <div className="relative">
                  <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                  <Input className="pl-11 h-11 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 text-sm transition-all rounded-xl w-full text-white placeholder:text-white/20" {...register('nome')} placeholder="Seu nome completo"/>
                </div>
              </Field>

              <Field label="E-mail profissional" error={errors.email?.message}>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                  <Input className="pl-11 h-11 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 text-sm transition-all rounded-xl w-full text-white placeholder:text-white/20" {...register('email')} placeholder="seu@empresa.com"/>
                </div>
              </Field>

              <Field label="Senha de segurança" error={errors.senha?.message}>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                  <Input className="pl-11 pr-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 text-sm transition-all rounded-xl w-full text-white placeholder:text-white/20" type={showP ? 'text' : 'password'} {...register('senha')} placeholder="Mínimo 8 caracteres"/>
                  <button type="button" onClick={() => setShowP(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors">
                    {showP ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {senhaValue && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                             style={{ background: i <= strength.score ? strength.color : '#1f2b24' }}/>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px]" style={{ color: strength.score < 2 ? '#8ba18e' : strength.color }}>
                      {strength.score < 2 ? '⚠ Adicione letras maiúsculas, números e símbolos.' : `✓ Nível de segurança: ${strength.label}`}
                    </p>
                  </div>
                )}
              </Field>

              <Field label="Confirmar senha corporativa" error={errors.confirma?.message}>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                  <Input className="pl-11 pr-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 text-sm transition-all rounded-xl w-full text-white placeholder:text-white/20" type={showC ? 'text' : 'password'} {...register('confirma')} placeholder="Repita a senha exatamente"/>
                  <button type="button" onClick={() => setShowC(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors">
                    {showC ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </Field>

              {errors.root?.message && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 px-3.5 py-2.5 text-xs font-semibold text-danger">{errors.root.message}</div>
              )}

              <Button type="submit" className="w-full h-11 text-sm font-bold bg-primary text-[#050a06] rounded-xl hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(79,226,136,0.3)] transition-all" loading={isSubmitting}>Concluir Cadastro</Button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]"/>
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Ou vincular via</span>
              <div className="h-px flex-1 bg-white/[0.06]"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[{label:'Google',logo:'https://www.google.com/favicon.ico'},{label:'Microsoft',logo:'https://www.microsoft.com/favicon.ico'}].map(sv=>(
                <button key={sv.label} type="button"
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.01] text-xs font-bold text-white/70 transition-all hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white">
                  <img src={sv.logo} width={14} height={14} alt={sv.label} className="grayscale opacity-70"/>{sv.label}
                </button>
              ))}
            </div>

            <p className="mt-5 text-center text-xs text-white/40 font-medium">
              Já possui registro ativo?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">Fazer login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}