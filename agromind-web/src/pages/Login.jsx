import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { Leaf, Eye, EyeOff, AlertCircle, ArrowRight, Activity, BarChart2, Shield, Zap } from 'lucide-react'

// Animação com delay escalonado
const anim = (delay = 0) => ({
  animation: `animY .65s cubic-bezier(.22,.61,.36,1) ${delay}s both`,
})

const features = [
  { icon: Activity,  title: 'Monitoramento em tempo real',  desc: 'Clima, solo e lavouras atualizados automaticamente.' },
  { icon: Zap,       title: 'Análise de risco inteligente', desc: 'Identifique ameaças antes que impactem sua produção.' },
  { icon: BarChart2, title: 'Relatórios e insights',        desc: 'Decisões estratégicas baseadas em dados precisos.'    },
  { icon: Shield,    title: 'Segurança empresarial',        desc: 'Criptografia avançada e backup automático.'           },
]

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused]   = useState(null)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.erro || 'E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (name) => ({
    width: '100%',
    padding: '13px 44px 13px 42px',
    borderRadius: 12,
    fontSize: 14,
    background: focused === name ? '#0f1a0f' : 'var(--color-brand-bg)',
    color: 'var(--color-brand-text)',
    border: `1.5px solid ${focused === name ? 'var(--color-brand-green)' : 'var(--color-brand-border)'}`,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all .2s ease',
    boxShadow: focused === name ? '0 0 0 4px rgba(61,122,82,.12)' : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>

      {/* ══ ESQUERDA ══ */}
      <div style={{ width: '52%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {/* Foto */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
          animation: 'zoomBg 25s ease-in-out infinite alternate',
        }}/>
        {/* Gradiente duplo para profundidade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(to bottom, rgba(11,15,11,.4) 0%, transparent 30%),
            linear-gradient(to right,  rgba(11,15,11,.92) 0%, rgba(11,15,11,.6) 55%, rgba(11,15,11,.2) 100%),
            linear-gradient(to top,    rgba(11,15,11,.8) 0%, transparent 40%)
          `,
        }}/>
        {/* Rede neural animada */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .2 }}
             viewBox="0 0 640 900" preserveAspectRatio="xMidYMid slice">
          {[[60,140],[190,260],[370,160],[530,320],[300,460],[90,540],[490,500],[230,660],[420,740],[70,740],[560,680]].map(([x,y],i,arr)=>
            arr.slice(i+1, i+3).map(([x2,y2],j) => (
              <line key={`${i}${j}`} x1={x} y1={y} x2={x2} y2={y2}
                    stroke="url(#lineGrad)" strokeWidth=".8" opacity=".6"/>
            ))
          )}
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#3d7a52" stopOpacity=".8"/>
              <stop offset="100%" stopColor="#4a9fbf" stopOpacity=".4"/>
            </linearGradient>
          </defs>
          {[[60,140],[190,260],[370,160],[530,320],[300,460],[90,540],[490,500],[230,660],[420,740],[70,740],[560,680]].map(([x,y],i) => (
            <g key={`n${i}`}>
              <circle cx={x} cy={y} r="3.5" fill="#5aab72" opacity=".8"/>
              <circle cx={x} cy={y} r="10" fill="#5aab72" opacity=".12"
                      style={{ animation: `pulse 3.5s ease-in-out ${i * .35}s infinite` }}/>
            </g>
          ))}
        </svg>

        {/* Conteúdo */}
        <div style={{ position: 'relative', zIndex: 10, padding: '48px 56px', height: '100%',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...anim(0) }}>
            <div style={{ width: 40, height: 40, borderRadius: 12,
                          background: 'rgba(61,122,82,.25)', border: '1px solid rgba(90,171,114,.4)',
                          backdropFilter: 'blur(12px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: 'glowPulse 3s ease-in-out infinite' }}>
              <Leaf size={18} color="#5aab72"/>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.3px' }}>AgroMind</span>
          </div>

          {/* Hero */}
          <div>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28,
                          padding: '5px 14px', borderRadius: 99,
                          background: 'rgba(61,122,82,.2)', border: '1px solid rgba(90,171,114,.3)',
                          backdropFilter: 'blur(8px)', ...anim(.08) }}>
              <Leaf size={11} color="#5aab72"/>
              <span style={{ fontSize: 11, color: '#5aab72', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Plataforma Agrícola
              </span>
            </div>

            {/* Headline com gradiente */}
            <div style={anim(.14)}>
              <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: .95, letterSpacing: '-2.5px',
                           color: '#fff', margin: '0 0 4px' }}>
                Inteligência
              </h1>
              <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: .95, letterSpacing: '-2.5px',
                           margin: '0 0 24px',
                           background: 'linear-gradient(135deg, #5aab72 0%, #4a9fbf 60%, #5aab72 100%)',
                           backgroundSize: '200% auto',
                           WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                           animation: 'shimmer 4s linear infinite' }}>
                para o campo.
              </h1>
            </div>

            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.75,
                        maxWidth: 380, margin: '0 0 48px', ...anim(.20) }}>
              Monitoramento climático, análise de risco e diagnóstico
              agronômico em tempo real para potencializar suas decisões.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {features.map((f, i) => (
                <div key={f.title}
                     style={{ display: 'flex', alignItems: 'center', gap: 14,
                              padding: '13px 16px', borderRadius: 14,
                              background: 'rgba(255,255,255,.04)',
                              border: '1px solid rgba(255,255,255,.07)',
                              backdropFilter: 'blur(16px)',
                              cursor: 'default',
                              transition: 'all .3s cubic-bezier(.22,.61,.36,1)',
                              ...anim(.26 + i * .07) }}
                     onMouseEnter={e => {
                       e.currentTarget.style.background   = 'rgba(61,122,82,.15)'
                       e.currentTarget.style.borderColor  = 'rgba(90,171,114,.3)'
                       e.currentTarget.style.transform    = 'translateX(8px)'
                       e.currentTarget.style.boxShadow    = '0 4px 20px rgba(61,122,82,.15)'
                     }}
                     onMouseLeave={e => {
                       e.currentTarget.style.background   = 'rgba(255,255,255,.04)'
                       e.currentTarget.style.borderColor  = 'rgba(255,255,255,.07)'
                       e.currentTarget.style.transform    = 'translateX(0)'
                       e.currentTarget.style.boxShadow    = 'none'
                     }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: 'rgba(61,122,82,.28)', border: '1px solid rgba(90,171,114,.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <f.icon size={16} color="#5aab72"/>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{f.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', ...anim(.62) }}>
            © 2026 AgroMind. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* ══ DIREITA ══ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '32px 40px', background: 'var(--color-brand-bg)',
                    position: 'relative', overflow: 'hidden' }}>

        {/* Glow de fundo */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                      width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
                      background: 'radial-gradient(circle, rgba(61,122,82,.08) 0%, transparent 70%)',
                      filter: 'blur(40px)' }}/>

        {/* Badge online */}
        <div style={{ position: 'absolute', top: 24, right: 28, ...anim(.05),
                      display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px',
                      borderRadius: 99, background: 'rgba(61,122,82,.1)',
                      border: '1px solid rgba(90,171,114,.2)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5aab72', flexShrink: 0,
                         animation: 'glowPulse 2.5s ease-in-out infinite' }}/>
          <span style={{ fontSize: 12, color: '#5aab72', fontWeight: 500 }}>Sistema online</span>
        </div>

        {/* Card principal */}
        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'var(--color-brand-surface)', borderRadius: 24,
                        border: '1px solid var(--color-brand-border)',
                        boxShadow: '0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.02)',
                        padding: '44px 40px 40px', ...anim(.12) }}>

            {/* Ilustração noturna */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, ...anim(.18) }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                            border: '1.5px solid rgba(90,171,114,.2)',
                            boxShadow: '0 0 0 8px rgba(61,122,82,.06), 0 16px 40px rgba(0,0,0,.4)',
                            animation: 'float 5s ease-in-out infinite' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <radialGradient id="skyGrad" cx="50%" cy="30%">
                      <stop offset="0%"   stopColor="#0a1f0a"/>
                      <stop offset="100%" stopColor="#060e06"/>
                    </radialGradient>
                  </defs>
                  <rect width="100" height="100" fill="url(#skyGrad)"/>
                  {/* Lua */}
                  <circle cx="70" cy="20" r="11" fill="#f5e6a3" opacity=".8"/>
                  <circle cx="75" cy="17" r="8.5" fill="#0a180a" opacity=".95"/>
                  {/* Estrelas */}
                  {[[12,10],[28,6],[46,14],[15,28],[80,26],[56,7],[88,14]].map(([x,y],i)=>(
                    <circle key={i} cx={x} cy={y} r="1.1" fill="#fff"
                            opacity=".65" style={{ animation:`pulse 3s ease ${i*.4}s infinite` }}/>
                  ))}
                  {/* Colinas */}
                  <path d="M0,60 Q24,42 48,56 Q72,70 96,52 L100,100 L0,100Z" fill="#122012"/>
                  <path d="M0,70 Q18,58 36,66 Q56,74 76,64 Q88,58 100,66 L100,100 L0,100Z" fill="#1e3620"/>
                  <path d="M0,78 Q50,68 100,76 L100,100 L0,100Z" fill="#2a4a2c"/>
                  {/* Casa */}
                  <rect x="37" y="65" width="16" height="13" fill="#162616" rx="1"/>
                  <polygon points="34,65 56,65 46,55" fill="#1e3020"/>
                  <rect x="43" y="71" width="4" height="7" fill="#060e06"/>
                  <rect x="38" y="67" width="4" height="4" fill="#4a9fbf" opacity=".5" rx="1"/>
                  <rect x="49" y="67" width="4" height="4" fill="#4a9fbf" opacity=".5" rx="1"/>
                  {/* Árvores */}
                  {[[26,68],[65,65],[72,71],[22,73]].map(([x,y],i)=>(
                    <g key={i}>
                      <rect x={x-1} y={y+5} width="2" height="5" fill="#2a1a0a"/>
                      <ellipse cx={x} cy={y} rx="5" ry="6.5" fill="#162616"/>
                      <ellipse cx={x} cy={y-2} rx="3.5" ry="4.5" fill="#1e3020"/>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Título */}
            <div style={{ textAlign: 'center', marginBottom: 32, ...anim(.24) }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-brand-text)',
                           margin: '0 0 8px', letterSpacing: '-.5px' }}>
                Bem-vindo de volta! 👋
              </h2>
              <p style={{ fontSize: 14, color: 'var(--color-brand-muted)', lineHeight: 1.6, margin: 0 }}>
                Acesse sua conta para continuar gerenciando<br/>suas operações agrícolas.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Email */}
              <div style={anim(.30)}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                                color: 'var(--color-brand-muted)', letterSpacing: '1.5px',
                                textTransform: 'uppercase', marginBottom: 8 }}>
                  E-mail
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: focused === 'email' ? '#5aab72' : 'var(--color-brand-muted)',
                                transition: 'color .2s', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                         placeholder="seu@email.com" required
                         style={inputStyle('email')}
                         onFocus={()=>setFocused('email')}
                         onBlur={()=>setFocused(null)}/>
                  {email && (
                    <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                  width: 22, height: 22, borderRadius: '50%',
                                  background: 'var(--color-brand-green)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  animation: 'scaleIn .2s ease both' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Senha */}
              <div style={anim(.36)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-brand-muted)',
                                  letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Senha
                  </label>
                  <button type="button" onClick={()=>navigate('/forgot-password')}
                          style={{ fontSize: 12, color: 'var(--color-brand-green-light)', fontWeight: 500,
                                   background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                   transition: 'opacity .15s' }}
                          onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
                          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                    Esqueci minha senha
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: focused === 'senha' ? '#5aab72' : 'var(--color-brand-muted)',
                                transition: 'color .2s', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <input type={showPass?'text':'password'} value={password}
                         onChange={e=>setPassword(e.target.value)}
                         placeholder="••••••••" required
                         style={inputStyle('senha')}
                         onFocus={()=>setFocused('senha')}
                         onBlur={()=>setFocused(null)}/>
                  <button type="button" onClick={()=>setShowPass(s=>!s)}
                          style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                   background: 'none', border: 'none', cursor: 'pointer',
                                   color: 'var(--color-brand-muted)', display: 'flex', padding: 2,
                                   transition: 'color .2s' }}
                          onMouseEnter={e=>e.currentTarget.style.color='var(--color-brand-text)'}
                          onMouseLeave={e=>e.currentTarget.style.color='var(--color-brand-muted)'}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px',
                              borderRadius: 10, background: 'rgba(192,57,43,.1)',
                              border: '1px solid rgba(192,57,43,.25)', color: '#f87171', fontSize: 13,
                              animation: 'scaleIn .2s ease both' }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }}/> {error}
                </div>
              )}

              {/* Botão entrar */}
              <div style={anim(.42)}>
                <button type="submit" disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                 width: '100%', padding: '14px', borderRadius: 13, fontSize: 15, fontWeight: 700,
                                 background: loading
                                   ? 'var(--color-brand-surface-2)'
                                   : 'linear-gradient(135deg, #3d7a52 0%, #2d6040 100%)',
                                 color: loading ? 'var(--color-brand-muted)' : '#fff',
                                 border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                 transition: 'all .25s ease',
                                 boxShadow: loading ? 'none' : '0 8px 28px rgba(61,122,82,.35)',
                                 letterSpacing: '.2px' }}
                        onMouseEnter={e => { if (!loading) {
                          e.currentTarget.style.transform  = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow  = '0 14px 36px rgba(61,122,82,.45)'
                        }}}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 28px rgba(61,122,82,.35)'
                        }}>
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,.25)',
                                     borderTopColor: '#fff', borderRadius: '50%',
                                     animation: 'spin .7s linear infinite', flexShrink: 0 }}/>
                      Entrando...
                    </>
                  ) : (
                    <><span>Entrar</span><ArrowRight size={16}/></>
                  )}
                </button>
              </div>

              {/* Divisor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...anim(.46) }}>
                <div style={{ flex: 1, height: 1, background: 'var(--color-brand-border)' }}/>
                <span style={{ fontSize: 12, color: 'var(--color-brand-muted)', whiteSpace: 'nowrap' }}>
                  ou continue com
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-brand-border)' }}/>
              </div>

              {/* Social */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, ...anim(.50) }}>
                {[
                  { label: 'Google',    logo: 'https://www.google.com/favicon.ico' },
                  { label: 'Microsoft', logo: 'https://www.microsoft.com/favicon.ico' },
                ].map(sv => (
                  <button key={sv.label} type="button"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                   padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                                   background: 'var(--color-brand-surface-2)',
                                   color: 'var(--color-brand-text-2)',
                                   border: '1.5px solid var(--color-brand-border)',
                                   cursor: 'pointer', transition: 'all .2s ease' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(90,171,114,.4)'
                            e.currentTarget.style.background  = 'rgba(61,122,82,.08)'
                            e.currentTarget.style.color       = '#fff'
                            e.currentTarget.style.transform   = 'translateY(-1px)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--color-brand-border)'
                            e.currentTarget.style.background  = 'var(--color-brand-surface-2)'
                            e.currentTarget.style.color       = 'var(--color-brand-text-2)'
                            e.currentTarget.style.transform   = 'translateY(0)'
                          }}>
                    <img src={sv.logo} width={16} height={16} alt={sv.label}/> {sv.label}
                  </button>
                ))}
              </div>

              {/* Cadastro */}
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-brand-muted)',
                          margin: 0, ...anim(.54) }}>
                Ainda não tem uma conta?{' '}
                <button type="button" onClick={()=>navigate('/register')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                 fontSize: 13, color: 'var(--color-brand-green-light)', fontWeight: 700,
                                 transition: 'opacity .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
                        onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  Cadastre-se
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
