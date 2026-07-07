import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail, Leaf, CloudSun } from 'lucide-react'
import { useState, useRef } from 'react'
import { useAuth } from '../store/AuthContext'
import { Button, Field, Input } from '../components/ui/Primitives'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

function CardHeaderIllustration() {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/5">
        <CloudSun size={36} className="text-primary animate-pulse" />
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-surface border border-border flex items-center justify-center shadow">
          <Leaf size={12} className="text-primary" />
        </div>
      </div>
    </div>
  )
}

// CENA EXPANDIDA - Ocupa 100% do espaço de fundo da section esquerda
function AgroTechFullscreenBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#040805" />
            <stop offset="40%" stopColor="#08100b" />
            <stop offset="100%" stopColor="#050a06" />
          </linearGradient>
          <linearGradient id="laserGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4fe288" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4fe288" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tractorBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1b3d24" />
            <stop offset="100%" stopColor="#2e693e" />
          </linearGradient>
        </defs>

        {/* Fundo do Céu Estendido */}
        <rect width="800" height="900" fill="url(#skyGrad)" />

        {/* Grade de Perspectiva Tecnológica Ampla */}
        <g opacity="0.08">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v-${i}`} x1={-100 + i * 120} y1="900" x2={200 + i * 50} y2="550" stroke="#4fe288" strokeWidth="1.5" />
          ))}
          <line x1="0" y1="650" x2="800" y2="650" stroke="#4fe288" strokeWidth="0.5" />
          <line x1="0" y1="720" x2="800" y2="720" stroke="#4fe288" strokeWidth="0.5" />
          <line x1="0" y1="800" x2="800" y2="800" stroke="#4fe288" strokeWidth="0.5" />
        </g>

        {/* Montanhas Distantes Geométricas */}
        <path d="M-100,600 Q150,520 400,570 T900,550 L900,900 L-100,900 Z" fill="#060c07" opacity="0.6" />
        <path d="M-100,630 Q200,560 500,610 T900,590 L900,900 L-100,900 Z" fill="#09140c" />

        {/* Solo Massivo / Área de Cultivo */}
        <rect x="-100" y="650" width="1000" height="260" fill="#0c1a0f" />

        {/* Linha de Cultivo 1 - Plantações Maiores na Frente */}
        <g fill="#3cb36b" opacity="0.85" style={{ transformOrigin: 'bottom', animation: 'wind 5s ease-in-out infinite' }}>
          {[40, 100, 160, 220, 280, 340, 400, 460, 520, 580, 640, 700, 760].map((x, i) => (
            <path key={`p1-${i}`} d={`M${x},760 Q${x - 10},720 ${x},700 Q${x + 10},720 ${x},760 Z`} />
          ))}
        </g>

        {/* Linha de Cultivo 2 - Plantações Intermediárias */}
        <g fill="#4fe288" opacity="0.7" style={{ transformOrigin: 'bottom', animation: 'wind 4s ease-in-out infinite alternate' }}>
          {[15, 75, 135, 195, 255, 315, 375, 435, 495, 555, 615, 675, 735, 795].map((x, i) => (
            <path key={`p2-${i}`} d={`M${x},840 Q${x - 12},790 ${x},760 Q${x + 12},790 ${x},840 Z`} />
          ))}
        </g>

        {/* TRATOR AUTÔNOMO INTEGRAÇÃO TOTAL (Cruza todo o horizonte da esquerda) */}
        <g style={{ animation: 'tractorDriveFull 12s linear infinite' }}>
          {/* Scanner Dinâmico */}
          <polygon points="215,650 150,730 280,730" fill="url(#laserGrad)" style={{ animation: 'laserScan 2.5s ease-in-out infinite alternate' }} />
          
          {/* Chassi do Trator de Escala Expandida */}
          <rect x="180" y="615" width="85" height="36" fill="url(#tractorBody)" rx="8" />
          <rect x="198" y="602" width="50" height="14" fill="#070d08" rx="4" />
          
          {/* LEDs de atividade */}
          <circle cx="236" cy="609" r="2.5" fill="#4fe288" style={{ animation: 'pulse 0.8s infinite' }} />
          <circle cx="188" cy="624" r="3" fill="#ffb84d" />
          <path d="M265,626 L274,629 L265,633 Z" fill="#fff" opacity="0.9" />

          {/* Rodas Robustas */}
          <g style={{ animation: 'wheelSpin 2s linear infinite', transformOrigin: '202px 651px' }}>
            <circle cx="202" cy="651" r="20" fill="#111" stroke="#1c241e" strokeWidth="2" />
            <circle cx="202" cy="651" r="13" fill="#292d2a" />
            <line x1="182" y1="651" x2="222" y2="651" stroke="#111" strokeWidth="4" />
            <line x1="202" y1="631" x2="202" y2="671" stroke="#111" strokeWidth="4" />
          </g>
          <g style={{ animation: 'wheelSpin 2s linear infinite', transformOrigin: '250px 655px' }}>
            <circle cx="250" cy="655" r="16" fill="#111" stroke="#1c241e" strokeWidth="2" />
            <circle cx="250" cy="655" r="10" fill="#292d2a" />
            <line x1="234" y1="655" x2="266" y2="655" stroke="#111" strokeWidth="3" />
            <line x1="250" y1="639" x2="250" y2="671" stroke="#111" strokeWidth="3" />
          </g>
        </g>

        {/* DRONE CORPORATIVO (Rastreamento Aéreo Amplo) */}
        <g style={{ animation: 'droneFlyWide 8s ease-in-out infinite' }}>
          <rect x="400" y="220" width="36" height="10" fill="#1a1a1a" rx="4" />
          <rect x="411" y="212" width="14" height="9" fill="#4fe288" />
          <line x1="385" y1="223" x2="451" y2="223" stroke="#333" strokeWidth="2.5" />
          <ellipse cx="385" cy="221" rx="16" ry="2" fill="#888" opacity="0.3" />
          <ellipse cx="451" cy="221" rx="16" ry="2" fill="#888" opacity="0.3" />
          <circle cx="418" cy="233" r="2" fill="#66c8ff" style={{ animation: 'pulse 0.6s infinite' }} />
        </g>
      </svg>

      <style>{`
        @keyframes tractorDriveFull {
          0% { transform: translateX(-300px); }
          100% { transform: translateX(950px); }
        }
        @keyframes wheelSpin {
          100% { transform: rotate(360deg); }
        }
        @keyframes laserScan {
          0% { transform: skewX(-12deg) scaleX(0.85); opacity: 0.3; }
          100% { transform: skewX(12deg) scaleX(1.15); opacity: 0.7; }
        }
        @keyframes droneFlyWide {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-80px, -40px) scale(1.05); }
        }
        @keyframes wind {
          0%, 100% { transform: skewX(0deg); }
          50% { transform: skewX(5deg); }
        }
      `}</style>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)')
  const [cardShadow, setCardShadow] = useState('0 40px 100px rgba(0,0,0,0.6)')
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5
    
    setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`)
    setCardShadow(`${-rotateY * 1.5}px ${rotateX * 1.5 + 40}px 75px rgba(0,0,0,0.65), 0 0 30px rgba(79,226,136,0.05)`)
  }

  const handleMouseLeave = () => {
    setCardTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setCardShadow('0 40px 100px rgba(0,0,0,0.6)')
  }

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
    <div className="grid min-h-screen lg:grid-cols-[1fr_460px] bg-[#060b08] font-sans antialiased text-white selection:bg-primary/30">
      
      {/* ── Seção Esquerda Integrada (Preenchimento Completo) ── */}
      <section className="relative hidden lg:flex flex-col justify-between p-16 overflow-hidden border-r border-white/[0.03]">
        
        {/* Renderização do SVG Inteligente como Background do painel esquerdo */}
        <AgroTechFullscreenBackground />
        
        {/* Conteúdo flutuando sobre a animação (Z-index alto e backgrounds gradientes para legibilidade) */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
            <Leaf size={16} className="text-primary"/>
          </div>
          <div>
            <p className="font-bold tracking-tight text-white">AgroMind</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Enterprise Ecosystem</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-4 bg-gradient-to-r from-[#040805]/90 via-[#040805]/40 to-transparent p-6 rounded-2xl backdrop-blur-[2px]">
          <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1]">
            A inteligência de dados <br />
            <span style={{
              background: 'linear-gradient(135deg, #4fe288, #66c8ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>aplicada ao campo.</span>
          </h1>
          <p className="text-base text-white/60 max-w-sm font-medium leading-relaxed">
            Acompanhe sua produção de ponta a ponta com monitoramento de precisão e automação analítica de solo e clima.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/30 font-medium">
          <p>© 2026 AgroMind Systems.</p>
          <p>v4.2.1-prod</p>
        </div>
      </section>

      {/* ── Seção Direita (Painel de Autenticação) ── */}
      <main className="relative flex items-center justify-center p-6 bg-[#090e0b] perspective-[1000px]">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full max-w-md rounded-3xl border border-white/[0.06] bg-[#0d130f]/85 backdrop-blur-xl p-8 transition-all duration-200 ease-out"
          style={{ 
            transform: cardTransform, 
            boxShadow: cardShadow,
            transformStyle: 'preserve-3d'
          }}
        >
          <div style={{ transform: 'translateZ(30px)' }} className="space-y-6">
            
            <CardHeaderIllustration />

            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-white">Bem-vindo ao painel</h2>
              <p className="text-xs text-white/50">Insira suas credenciais corporativas para acessar o sistema.</p>
            </div>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <Field label="E-mail corporativo" error={errors.email?.message}>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input 
                    className="pl-11 h-11 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 text-sm transition-all rounded-xl w-full text-white placeholder:text-white/20" 
                    {...register('email')} 
                    placeholder="nome@empresa.com" 
                    autoComplete="email"
                  />
                </div>
              </Field>

              <Field label="Senha de acesso" error={errors.password?.message}>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input 
                    className="pl-11 pr-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-primary/50 text-sm transition-all rounded-xl w-full text-white placeholder:text-white/20" 
                    type={showPassword ? 'text' : 'password'} 
                    {...register('password')} 
                    placeholder="••••••••" 
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </Field>

              {authError && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 px-3.5 py-2.5 text-xs font-semibold text-danger">
                  {authError}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-bold bg-primary text-[#050a06] rounded-xl hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(79,226,136,0.3)] transition-all" 
                loading={isSubmitting}
              >
                Autenticar Conta
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Single Sign-On</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Google', logo: 'https://www.google.com/favicon.ico' },
                { label: 'Microsoft', logo: 'https://www.microsoft.com/favicon.ico' },
              ].map(sv => (
                <button 
                  key={sv.label} 
                  type="button"
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.01] text-xs font-bold text-white/70 transition-all hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white"
                >
                  <img src={sv.logo} width={14} height={14} alt={sv.label} className="grayscale opacity-70 group-hover:grayscale-0" />
                  {sv.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <Link to="/forgot-password" className="font-semibold text-white/40 hover:text-primary transition-colors">Recuperar chave de acesso</Link>
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">Solicitar Registro</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}