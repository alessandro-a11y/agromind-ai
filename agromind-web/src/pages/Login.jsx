import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { Leaf, Eye, EyeOff, AlertCircle, ArrowRight, Monitor, BarChart2, Shield } from 'lucide-react'

const features = [
  { icon: Monitor,  title: 'Monitoramento em tempo real',   desc: 'Dados climáticos atualizados automaticamente para sua região.'                   },
  { icon: Leaf,     title: 'Análise de risco inteligente',  desc: 'Identifique ameaças e oportunidades antes que impactem sua produção.'             },
  { icon: BarChart2,title: 'Relatórios e insights',         desc: 'Informações completas para decisões estratégicas mais assertivas.'                },
  { icon: Shield,   title: 'Seus dados estão protegidos',   desc: 'Segurança de nível empresarial com criptografia avançada e backup automático.',   },
]

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
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

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'var(--font-sans)' }}>

      {/* Painel esquerdo — imagem + features */}
      <div style={{
        width:'55%', position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg,#0a1a0a 0%,#0f2a0f 40%,#1a3a1a 100%)',
      }}>
        {/* Imagem de fundo */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:`url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80')`,
          backgroundSize:'cover', backgroundPosition:'center',
          opacity:.35,
        }}/>
        {/* Overlay gradiente */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to right, rgba(10,26,10,0.7) 0%, rgba(10,26,10,0.4) 100%)',
        }}/>
        {/* Rede neural decorativa */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.15 }}
             viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
          {[[100,200],[200,350],[350,250],[450,400],[300,500],[150,600],[500,550],[250,700]].map(([x,y],i,arr)=>
            arr.slice(i+1,i+3).map(([ x2,y2],j)=>(
              <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#4a7c59" strokeWidth=".8"/>
            ))
          )}
          {[[100,200],[200,350],[350,250],[450,400],[300,500],[150,600],[500,550],[250,700]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="4" fill="#6aab7a"/>
          ))}
        </svg>

        {/* Conteúdo */}
        <div style={{ position:'relative', zIndex:10, padding:'48px 52px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(74,124,89,0.3)',
                          border:'1px solid rgba(106,171,122,0.4)',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Leaf size={18} color="#6aab7a"/>
            </div>
            <span style={{ fontSize:18, fontWeight:700, color:'#fff', letterSpacing:'.5px' }}>AgroMind</span>
          </div>

          {/* Headline + features */}
          <div>
            {/* Badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px',
                          borderRadius:20, background:'rgba(74,124,89,0.2)',
                          border:'1px solid rgba(106,171,122,0.35)', marginBottom:24 }}>
              <Leaf size={12} color="#6aab7a"/>
              <span style={{ fontSize:11, color:'#6aab7a', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase' }}>
                Plataforma Agrícola
              </span>
            </div>

            <h1 style={{ fontSize:52, fontWeight:800, lineHeight:1.05, margin:'0 0 8px',
                         color:'#fff', letterSpacing:'-1.5px' }}>
              Inteligência
            </h1>
            <h1 style={{ fontSize:52, fontWeight:800, lineHeight:1.05, margin:'0 0 20px',
                         color:'#6aab7a', letterSpacing:'-1.5px' }}>
              para o campo.
            </h1>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.65)', lineHeight:1.7,
                        maxWidth:400, margin:'0 0 40px' }}>
              Monitoramento climático, análise de risco e diagnóstico agronômico
              em tempo real para potencializar suas decisões.
            </p>

            {/* Features */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {features.map(f => (
                <div key={f.title} style={{ display:'flex', alignItems:'flex-start', gap:14,
                                            padding:'14px 16px', borderRadius:12,
                                            background:'rgba(255,255,255,0.05)',
                                            border:'1px solid rgba(255,255,255,0.08)',
                                            backdropFilter:'blur(8px)' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:'rgba(74,124,89,0.25)',
                                border:'1px solid rgba(106,171,122,0.3)', flexShrink:0,
                                display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <f.icon size={16} color="#6aab7a"/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 3px' }}>{f.title}</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé */}
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', margin:0 }}>
            © 2026 AgroMind. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'40px 32px', background:'var(--color-brand-bg)', position:'relative',
      }}>
        {/* Badge sistema online */}
        <div style={{ position:'absolute', top:24, right:24, display:'flex', alignItems:'center', gap:6,
                      padding:'5px 12px', borderRadius:20, background:'rgba(74,124,89,0.15)',
                      border:'1px solid rgba(106,171,122,0.3)' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#6aab7a', display:'inline-block',
                         boxShadow:'0 0 6px #6aab7a' }}/>
          <span style={{ fontSize:12, color:'#6aab7a', fontWeight:500 }}>Sistema online</span>
        </div>

        {/* Card */}
        <div style={{ width:'100%', maxWidth:420,
                      background:'var(--color-brand-surface)',
                      border:'1px solid var(--color-brand-border)',
                      borderRadius:20, padding:'36px 36px 32px', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>

          {/* Ilustração circular */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
            <div style={{ width:100, height:100, borderRadius:'50%', overflow:'hidden', position:'relative',
                          border:'2px solid var(--color-brand-border)',
                          background:'linear-gradient(135deg,#0f2a0f,#1a3a1a)' }}>
              <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%' }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="moonGlow">
                    <stop offset="0%" stopColor="#f5e6a3" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#c9b85a" stopOpacity=".6"/>
                  </radialGradient>
                </defs>
                {/* Céu */}
                <rect width="100" height="100" fill="#0a1a0a"/>
                {/* Luar */}
                <circle cx="72" cy="22" r="12" fill="url(#moonGlow)" opacity=".8"/>
                <circle cx="77" cy="19" r="9" fill="#0d1f0d" opacity=".95"/>
                {/* Estrelas */}
                {[[15,12],[30,8],[50,15],[20,30],[85,30],[60,8]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="1" fill="#fff" opacity=".7"/>
                ))}
                {/* Colinas */}
                <path d="M0,65 Q25,45 50,60 Q75,75 100,55 L100,100 L0,100Z" fill="#1a3a1a"/>
                <path d="M0,75 Q20,62 40,70 Q60,78 80,68 Q90,63 100,70 L100,100 L0,100Z" fill="#2d5236"/>
                {/* Campo */}
                <path d="M0,82 Q50,72 100,80 L100,100 L0,100Z" fill="#3a6b45"/>
                {/* Casa */}
                <rect x="38" y="68" width="18" height="14" fill="#1e3a1e" rx="1"/>
                <polygon points="35,68 59,68 48.5,58" fill="#2a4a2a"/>
                <rect x="44" y="74" width="5" height="8" fill="#0a1a0a"/>
                {/* Janelas com luz */}
                <rect x="39" y="70" width="4" height="4" fill="#4a9fbf" opacity=".6" rx="1"/>
                <rect x="51" y="70" width="4" height="4" fill="#4a9fbf" opacity=".6" rx="1"/>
                {/* Árvores */}
                {[[28,70],[65,67],[72,73],[22,75]].map(([x,y],i)=>(
                  <g key={i}>
                    <rect x={x-1} y={y+5} width="2" height="6" fill="#3a2a1a"/>
                    <ellipse cx={x} cy={y} rx="5" ry="7" fill="#1e3a1e"/>
                    <ellipse cx={x} cy={y-2} rx="3.5" ry="5" fill="#2d5236"/>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <h2 style={{ fontSize:22, fontWeight:700, color:'var(--color-brand-text)',
                       textAlign:'center', margin:'0 0 6px' }}>
            Bem-vindo de volta! 👋
          </h2>
          <p style={{ fontSize:13, color:'var(--color-brand-muted)', textAlign:'center', margin:'0 0 28px', lineHeight:1.5 }}>
            Acesse sua conta para continuar gerenciando<br/>suas operações agrícolas.
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--color-brand-muted)',
                              letterSpacing:'1.5px', textTransform:'uppercase', display:'block', marginBottom:6 }}>
                E-mail
              </label>
              <div style={{ position:'relative' }}>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                       placeholder="seu@email.com" required
                       style={{ width:'100%', padding:'11px 40px 11px 14px', borderRadius:10, fontSize:14,
                                background:'var(--color-brand-bg)', color:'var(--color-brand-text)',
                                border:'1px solid var(--color-brand-border)', outline:'none',
                                boxSizing:'border-box', transition:'border-color .2s' }}
                       onFocus={e=>e.target.style.borderColor='var(--color-brand-green)'}
                       onBlur={e=>e.target.style.borderColor='var(--color-brand-border)'}/>
                {email && (
                  <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--color-brand-green)',
                                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>✓</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Senha */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--color-brand-muted)',
                                letterSpacing:'1.5px', textTransform:'uppercase' }}>
                  Senha
                </label>
                <button type="button" style={{ fontSize:12, color:'var(--color-brand-green-light)',
                                               background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  Esqueci minha senha
                </button>
              </div>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                              color:'var(--color-brand-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input type={showPass?'text':'password'} value={password}
                       onChange={e=>setPassword(e.target.value)}
                       placeholder="••••••••" required
                       style={{ width:'100%', padding:'11px 42px 11px 36px', borderRadius:10, fontSize:14,
                                background:'var(--color-brand-bg)', color:'var(--color-brand-text)',
                                border:'1px solid var(--color-brand-border)', outline:'none',
                                boxSizing:'border-box', transition:'border-color .2s' }}
                       onFocus={e=>e.target.style.borderColor='var(--color-brand-green)'}
                       onBlur={e=>e.target.style.borderColor='var(--color-brand-border)'}/>
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                                 background:'none', border:'none', cursor:'pointer',
                                 color:'var(--color-brand-muted)', display:'flex', alignItems:'center' }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:8,
                            background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.3)',
                            color:'#f87171', fontSize:13 }}>
                <AlertCircle size={14}/> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                             padding:'13px', borderRadius:10, fontSize:15, fontWeight:700,
                             background: loading?'var(--color-brand-border)':'var(--color-brand-green)',
                             color: loading?'var(--color-brand-muted)':'#fff',
                             border:'none', cursor: loading?'not-allowed':'pointer',
                             transition:'all .2s', marginTop:4 }}>
              {loading ? 'Entrando...' : <><span>Entrar</span><ArrowRight size={16}/></>}
            </button>

            {/* Divisor */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0' }}>
              <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
              <span style={{ fontSize:12, color:'var(--color-brand-muted)' }}>ou continue com</span>
              <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
            </div>

            {/* Social */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Google',    logo:'https://www.google.com/favicon.ico' },
                { label:'Microsoft', logo:'https://www.microsoft.com/favicon.ico' },
              ].map(s => (
                <button key={s.label} type="button"
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                 padding:'10px', borderRadius:10, fontSize:13, fontWeight:500,
                                 background:'var(--color-brand-bg)', color:'var(--color-brand-text)',
                                 border:'1px solid var(--color-brand-border)', cursor:'pointer',
                                 transition:'border-color .2s' }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-brand-green)'}
                        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-brand-border)'}>
                  <img src={s.logo} width={16} height={16} alt={s.label}/>
                  {s.label}
                </button>
              ))}
            </div>

            <p style={{ textAlign:'center', fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>
              Ainda não tem uma conta?{' '}
              <button type="button" onClick={()=>navigate('/register')} style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                                             fontSize:13, color:'var(--color-brand-green-light)', fontWeight:600 }}>
                Cadastre-se
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
