import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, AlertCircle, ArrowRight, TrendingUp, Shield, CloudRain, Lock } from 'lucide-react'
import api from '../services/api'

const anim = (delay = 0) => ({
  animation: `animY .65s cubic-bezier(.22,.61,.36,1) ${delay}s both`,
})

const features = [
  { icon: TrendingUp, title: 'Dados em tempo real',         desc: 'Monitore o clima, o solo e suas lavouras em tempo real.'              },
  { icon: Shield,     title: 'Decisões mais assertivas',    desc: 'Receba insights e recomendações para aumentar sua produtividade.'     },
  { icon: CloudRain,  title: 'Previsões e alertas',         desc: 'Antecipe eventos climáticos e reduza riscos na sua produção.'         },
  { icon: Lock,       title: 'Segurança e confiabilidade',  desc: 'Criptografia avançada e backup automático para seus dados.'           },
  { icon: Leaf,       title: null,                          desc: 'Junte-se a agricultores colhendo os resultados da tecnologia.'        },
]

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let s = 0
  if (pwd.length >= 8)           s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return [
    { score: 0, label: '',       color: '' },
    { score: 1, label: 'Fraca',  color: '#c0392b' },
    { score: 2, label: 'Média',  color: '#c9933a' },
    { score: 3, label: 'Boa',    color: '#4a9fbf' },
    { score: 4, label: 'Forte',  color: '#3d7a52' },
  ][s]
}

export default function Register() {
  const navigate = useNavigate()
  const [nome,     setNome]     = useState('')
  const [email,    setEmail]    = useState('')
  const [senha,    setSenha]    = useState('')
  const [confirma, setConfirma] = useState('')
  const [showP,    setShowP]    = useState(false)
  const [showC,    setShowC]    = useState(false)
  const [focused,  setFocused]  = useState(null)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const strength = getStrength(senha)
  const mismatch = confirma && confirma !== senha

  const inputStyle = (name) => ({
    width: '100%', padding: '13px 44px 13px 42px', borderRadius: 12, fontSize: 14,
    background: focused === name ? '#0f1a0f' : 'var(--color-brand-bg)',
    color: 'var(--color-brand-text)',
    border: `1.5px solid ${focused === name ? 'var(--color-brand-green)' : mismatch && name === 'confirma' ? '#c0392b' : 'var(--color-brand-border)'}`,
    outline: 'none', boxSizing: 'border-box', transition: 'all .2s ease',
    boxShadow: focused === name ? '0 0 0 4px rgba(61,122,82,.12)' : 'none',
  })

  const LockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (senha !== confirma) { setError('As senhas não coincidem.'); return }
    if (strength.score < 2) { setError('Crie uma senha mais forte.'); return }
    setLoading(true)
    try {
      await api.post('/auth/register', { nome, email, senha, role: 0 })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>

      {/* ══ ESQUERDA ══ */}
      <div style={{ width: '45%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0,
                      backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80')`,
                      backgroundSize: 'cover', backgroundPosition: 'center 40%',
                      animation: 'zoomBg 25s ease-in-out infinite alternate' }}/>
        <div style={{ position: 'absolute', inset: 0,
                      background: `linear-gradient(to bottom, rgba(11,15,11,.4) 0%, transparent 30%),
                                   linear-gradient(to right, rgba(11,15,11,.92) 0%, rgba(11,15,11,.6) 55%, rgba(11,15,11,.2) 100%),
                                   linear-gradient(to top, rgba(11,15,11,.8) 0%, transparent 40%)` }}/>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .2 }}
             viewBox="0 0 500 900" preserveAspectRatio="xMidYMid slice">
          {[[60,140],[190,260],[370,160],[420,380],[280,480],[120,580],[460,520],[220,680],[350,750]].map(([x,y],i,arr)=>
            arr.slice(i+1,i+3).map(([x2,y2],j)=>(
              <line key={`${i}${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#3d7a52" strokeWidth=".8" opacity=".6"/>
            ))
          )}
          {[[60,140],[190,260],[370,160],[420,380],[280,480],[120,580],[460,520],[220,680],[350,750]].map(([x,y],i)=>(
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="#5aab72" opacity=".8"/>
              <circle cx={x} cy={y} r="10" fill="#5aab72" opacity=".12"
                      style={{ animation: `pulse 3.5s ease ${i*.35}s infinite` }}/>
            </g>
          ))}
        </svg>

        <div style={{ position: 'relative', zIndex: 10, padding: '48px 44px', height: '100%',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...anim(0) }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(61,122,82,.25)',
                          border: '1px solid rgba(90,171,114,.4)', backdropFilter: 'blur(12px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: 'glowPulse 3s ease-in-out infinite' }}>
              <Leaf size={18} color="#5aab72"/>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>AgroMind</span>
          </div>

          <div>
            <div style={{ ...anim(.10) }}>
              <h1 style={{ fontSize: 50, fontWeight: 900, color: '#fff', letterSpacing: '-2px', margin: '0 0 4px', lineHeight: .95 }}>
                Inteligência
              </h1>
              <h1 style={{ fontSize: 50, fontWeight: 900, letterSpacing: '-2px', margin: '0 0 20px', lineHeight: .95,
                           background: 'linear-gradient(135deg,#5aab72,#4a9fbf,#5aab72)',
                           backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                           animation: 'shimmer 4s linear infinite' }}>
                para o campo.
              </h1>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, maxWidth: 340, margin: '0 0 36px', ...anim(.16) }}>
              Crie sua conta e comece a transformar dados em{' '}
              <span style={{ color: '#5aab72', fontWeight: 600 }}>decisões mais inteligentes</span>{' '}
              para a sua produção agrícola.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {features.map((f,i) => (
                <div key={i}
                     style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                              borderRadius: 14, background: 'rgba(255,255,255,.04)',
                              border: '1px solid rgba(255,255,255,.07)', backdropFilter: 'blur(16px)',
                              cursor: 'default', transition: 'all .3s cubic-bezier(.22,.61,.36,1)',
                              ...anim(.22 + i * .07) }}
                     onMouseEnter={e => {
                       e.currentTarget.style.background  = 'rgba(61,122,82,.15)'
                       e.currentTarget.style.borderColor = 'rgba(90,171,114,.3)'
                       e.currentTarget.style.transform   = 'translateX(8px)'
                       e.currentTarget.style.boxShadow   = '0 4px 20px rgba(61,122,82,.15)'
                     }}
                     onMouseLeave={e => {
                       e.currentTarget.style.background  = 'rgba(255,255,255,.04)'
                       e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'
                       e.currentTarget.style.transform   = 'translateX(0)'
                       e.currentTarget.style.boxShadow   = 'none'
                     }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                background: 'rgba(61,122,82,.28)', border: '1px solid rgba(90,171,114,.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <f.icon size={15} color="#5aab72"/>
                  </div>
                  <div>
                    {f.title && <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 1px' }}>{f.title}</p>}
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', ...anim(.7) }}>© 2026 AgroMind.</p>
        </div>
      </div>

      {/* ══ DIREITA ══ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '32px 40px', background: 'var(--color-brand-bg)',
                    position: 'relative', overflow: 'hidden', overflowY: 'auto' }}>

        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                      width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
                      background: 'radial-gradient(circle, rgba(61,122,82,.07) 0%, transparent 70%)',
                      filter: 'blur(40px)' }}/>

        <div style={{ position: 'absolute', top: 24, right: 28, ...anim(.05),
                      display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px',
                      borderRadius: 99, background: 'rgba(61,122,82,.1)',
                      border: '1px solid rgba(90,171,114,.2)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5aab72',
                         animation: 'glowPulse 2.5s ease-in-out infinite' }}/>
          <span style={{ fontSize: 12, color: '#5aab72', fontWeight: 500 }}>Sistema online</span>
        </div>

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, padding: '60px 0 32px' }}>
          <div style={{ background: 'var(--color-brand-surface)', borderRadius: 24,
                        border: '1px solid var(--color-brand-border)',
                        boxShadow: '0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.02)',
                        padding: '40px 40px 36px', ...anim(.12) }}>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, ...anim(.18) }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%',
                            background: 'rgba(61,122,82,.12)', border: '1.5px solid rgba(90,171,114,.25)',
                            boxShadow: '0 0 0 8px rgba(61,122,82,.05), 0 16px 40px rgba(0,0,0,.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'float 5s ease-in-out infinite' }}>
                <Leaf size={32} color="#5aab72"/>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 28, ...anim(.24) }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-brand-text)',
                           margin: '0 0 8px', letterSpacing: '-.5px' }}>Criar conta</h2>
              <p style={{ fontSize: 14, color: 'var(--color-brand-muted)', margin: 0 }}>
                Preencha os dados abaixo para começar
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Nome */}
              <div style={anim(.30)}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-brand-muted)',
                                letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Nome completo
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: focused==='nome' ? '#5aab72' : 'var(--color-brand-muted)',
                                transition: 'color .2s', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input type="text" value={nome} onChange={e=>setNome(e.target.value)}
                         placeholder="Digite seu nome completo" required
                         style={inputStyle('nome')}
                         onFocus={()=>setFocused('nome')} onBlur={()=>setFocused(null)}/>
                </div>
              </div>

              {/* Email */}
              <div style={anim(.35)}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-brand-muted)',
                                letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                  E-mail
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: focused==='email' ? '#5aab72' : 'var(--color-brand-muted)',
                                transition: 'color .2s', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                         placeholder="Digite seu melhor e-mail" required
                         style={inputStyle('email')}
                         onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)}/>
                  {email && (
                    <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                  width: 22, height: 22, borderRadius: '50%', background: 'var(--color-brand-green)',
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
              <div style={anim(.40)}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-brand-muted)',
                                letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: focused==='senha' ? '#5aab72' : 'var(--color-brand-muted)',
                                transition: 'color .2s', display: 'flex' }}>
                    <LockIcon/>
                  </div>
                  <input type={showP?'text':'password'} value={senha} onChange={e=>setSenha(e.target.value)}
                         placeholder="Crie uma senha forte" required
                         style={inputStyle('senha')}
                         onFocus={()=>setFocused('senha')} onBlur={()=>setFocused(null)}/>
                  <button type="button" onClick={()=>setShowP(s=>!s)}
                          style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                   background: 'none', border: 'none', cursor: 'pointer',
                                   color: 'var(--color-brand-muted)', display: 'flex', padding: 2,
                                   transition: 'color .2s' }}
                          onMouseEnter={e=>e.currentTarget.style.color='var(--color-brand-text)'}
                          onMouseLeave={e=>e.currentTarget.style.color='var(--color-brand-muted)'}>
                    {showP ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {senha && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, transition: 'background .3s',
                                              background: i <= strength.score ? strength.color : 'var(--color-brand-border)' }}/>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, margin: 0,
                                color: strength.score < 2 ? 'var(--color-brand-muted)' : strength.color }}>
                      {strength.score < 2
                        ? '⚠ Use ao menos 8 caracteres com maiúscula, número e símbolo.'
                        : `✓ Força da senha: ${strength.label}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar senha */}
              <div style={anim(.45)}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-brand-muted)',
                                letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Confirmar senha
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: mismatch ? '#c0392b' : focused==='confirma' ? '#5aab72' : 'var(--color-brand-muted)',
                                transition: 'color .2s', display: 'flex' }}>
                    <LockIcon/>
                  </div>
                  <input type={showC?'text':'password'} value={confirma} onChange={e=>setConfirma(e.target.value)}
                         placeholder="Confirme sua senha" required
                         style={inputStyle('confirma')}
                         onFocus={()=>setFocused('confirma')} onBlur={()=>setFocused(null)}/>
                  <button type="button" onClick={()=>setShowC(s=>!s)}
                          style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                   background: 'none', border: 'none', cursor: 'pointer',
                                   color: 'var(--color-brand-muted)', display: 'flex', padding: 2,
                                   transition: 'color .2s' }}
                          onMouseEnter={e=>e.currentTarget.style.color='var(--color-brand-text)'}
                          onMouseLeave={e=>e.currentTarget.style.color='var(--color-brand-muted)'}>
                    {showC ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {mismatch && (
                  <p style={{ fontSize: 11, color: '#f87171', margin: '6px 0 0' }}>✗ As senhas não coincidem.</p>
                )}
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', borderRadius: 10,
                              background: 'rgba(192,57,43,.1)', border: '1px solid rgba(192,57,43,.25)',
                              color: '#f87171', fontSize: 13, animation: 'scaleIn .2s ease both' }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }}/> {error}
                </div>
              )}

              <div style={anim(.50)}>
                <button type="submit" disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                 width: '100%', padding: '14px', borderRadius: 13, fontSize: 15, fontWeight: 700,
                                 background: loading ? 'var(--color-brand-surface-2)' : 'linear-gradient(135deg,#3d7a52,#2d6040)',
                                 color: loading ? 'var(--color-brand-muted)' : '#fff',
                                 border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                 transition: 'all .25s ease',
                                 boxShadow: loading ? 'none' : '0 8px 28px rgba(61,122,82,.35)' }}
                        onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(61,122,82,.45)' }}}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=loading?'none':'0 8px 28px rgba(61,122,82,.35)' }}>
                  {loading
                    ? <><span style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,.25)',
                                       borderTopColor:'#fff', borderRadius:'50%',
                                       animation:'spin .7s linear infinite', flexShrink:0 }}/> Criando conta...</>
                    : <><span>Criar conta</span><ArrowRight size={16}/></>}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...anim(.54) }}>
                <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
                <span style={{ fontSize:12, color:'var(--color-brand-muted)', whiteSpace:'nowrap' }}>ou cadastre-se com</span>
                <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, ...anim(.58) }}>
                {[{label:'Google',logo:'https://www.google.com/favicon.ico'},{label:'Microsoft',logo:'https://www.microsoft.com/favicon.ico'}].map(sv=>(
                  <button key={sv.label} type="button"
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:9,
                                   padding:'12px', borderRadius:12, fontSize:13, fontWeight:500,
                                   background:'var(--color-brand-surface-2)', color:'var(--color-brand-text-2)',
                                   border:'1.5px solid var(--color-brand-border)', cursor:'pointer', transition:'all .2s ease' }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(90,171,114,.4)'; e.currentTarget.style.background='rgba(61,122,82,.08)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-1px)' }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--color-brand-border)'; e.currentTarget.style.background='var(--color-brand-surface-2)'; e.currentTarget.style.color='var(--color-brand-text-2)'; e.currentTarget.style.transform='translateY(0)' }}>
                    <img src={sv.logo} width={16} height={16} alt={sv.label}/> {sv.label}
                  </button>
                ))}
              </div>

              <p style={{ textAlign:'center', fontSize:13, color:'var(--color-brand-muted)', margin:0, ...anim(.62) }}>
                Já tem uma conta?{' '}
                <button type="button" onClick={()=>navigate('/login')}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                                 fontSize:13, color:'var(--color-brand-green-light)', fontWeight:700, transition:'opacity .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
                        onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  Entrar
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
