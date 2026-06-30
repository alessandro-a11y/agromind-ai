import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Shield, TrendingUp, ArrowLeft, Send, CheckCircle } from 'lucide-react'

const anim = (delay = 0) => ({
  animation: `animY .65s cubic-bezier(.22,.61,.36,1) ${delay}s both`,
})

const features = [
  { icon: Shield,     title: 'Seguro e confiável',           desc: 'Seus dados estão protegidos com criptografia de ponta a ponta.'   },
  { icon: Leaf,       title: 'Tecnologia para o campo',      desc: 'Soluções inteligentes para otimizar sua produção agrícola.'       },
  { icon: TrendingUp, title: 'Insights que geram resultados',desc: 'Transforme dados em decisões estratégicas e aumente sua produtividade.' },
]

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [focused, setFocused] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    setSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'var(--font-sans)', overflow:'hidden' }}>

      {/* ══ ESQUERDA ══ */}
      <div style={{ width:'45%', position:'relative', overflow:'hidden', flexShrink:0 }}>
        <div style={{ position:'absolute', inset:0,
                      backgroundImage:`url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80')`,
                      backgroundSize:'cover', backgroundPosition:'center 40%',
                      animation:'zoomBg 25s ease-in-out infinite alternate' }}/>
        <div style={{ position:'absolute', inset:0,
                      background:`linear-gradient(to bottom, rgba(11,15,11,.4) 0%, transparent 30%),
                                  linear-gradient(to right, rgba(11,15,11,.92) 0%, rgba(11,15,11,.6) 55%, rgba(11,15,11,.2) 100%),
                                  linear-gradient(to top, rgba(11,15,11,.8) 0%, transparent 40%)` }}/>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.2 }}
             viewBox="0 0 500 900" preserveAspectRatio="xMidYMid slice">
          {[[60,140],[190,260],[370,160],[420,380],[280,480],[120,580],[460,520],[220,680]].map(([x,y],i,arr)=>
            arr.slice(i+1,i+3).map(([x2,y2],j)=>(
              <line key={`${i}${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#3d7a52" strokeWidth=".8" opacity=".6"/>
            ))
          )}
          {[[60,140],[190,260],[370,160],[420,380],[280,480],[120,580],[460,520],[220,680]].map(([x,y],i)=>(
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="#5aab72" opacity=".8"/>
              <circle cx={x} cy={y} r="10" fill="#5aab72" opacity=".12"
                      style={{ animation:`pulse 3.5s ease ${i*.35}s infinite` }}/>
            </g>
          ))}
        </svg>

        <div style={{ position:'relative', zIndex:10, padding:'48px 44px', height:'100%',
                      display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, ...anim(0) }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(61,122,82,.25)',
                          border:'1px solid rgba(90,171,114,.4)', backdropFilter:'blur(12px)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          animation:'glowPulse 3s ease-in-out infinite' }}>
              <Leaf size={18} color="#5aab72"/>
            </div>
            <span style={{ fontSize:18, fontWeight:800, color:'#fff' }}>AgroMind</span>
          </div>

          <div>
            <div style={anim(.10)}>
              <h1 style={{ fontSize:50, fontWeight:900, color:'#fff', letterSpacing:'-2px', margin:'0 0 4px', lineHeight:.95 }}>
                Inteligência
              </h1>
              <h1 style={{ fontSize:50, fontWeight:900, letterSpacing:'-2px', margin:'0 0 20px', lineHeight:.95,
                           background:'linear-gradient(135deg,#5aab72,#4a9fbf,#5aab72)',
                           backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                           animation:'shimmer 4s linear infinite' }}>
                para o campo.
              </h1>
            </div>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.55)', lineHeight:1.75, maxWidth:340, margin:'0 0 36px', ...anim(.16) }}>
              Recupere o acesso à sua conta e continue tomando{' '}
              <span style={{ color:'#5aab72', fontWeight:600 }}>decisões mais inteligentes</span>{' '}
              para a sua produção.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {features.map((f,i) => (
                <div key={i}
                     style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px',
                              borderRadius:14, background:'rgba(255,255,255,.04)',
                              border:'1px solid rgba(255,255,255,.07)', backdropFilter:'blur(16px)',
                              cursor:'default', transition:'all .3s cubic-bezier(.22,.61,.36,1)',
                              ...anim(.22 + i * .08) }}
                     onMouseEnter={e=>{ e.currentTarget.style.background='rgba(61,122,82,.15)'; e.currentTarget.style.borderColor='rgba(90,171,114,.3)'; e.currentTarget.style.transform='translateX(8px)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(61,122,82,.15)' }}
                     onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.transform='translateX(0)'; e.currentTarget.style.boxShadow='none' }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0,
                                background:'rgba(61,122,82,.28)', border:'1px solid rgba(90,171,114,.25)',
                                display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <f.icon size={15} color="#5aab72"/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 1px' }}>{f.title}</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', margin:0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Card suporte */}
            <div style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,.04)',
                          border:'1px solid rgba(255,255,255,.07)', cursor:'pointer',
                          transition:'all .3s ease', ...anim(.50) }}
                 onMouseEnter={e=>{ e.currentTarget.style.background='rgba(61,122,82,.15)'; e.currentTarget.style.borderColor='rgba(90,171,114,.3)'; e.currentTarget.style.transform='translateX(8px)' }}
                 onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; e.currentTarget.style.transform='translateX(0)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'rgba(61,122,82,.28)',
                              border:'1px solid rgba(90,171,114,.25)', flexShrink:0,
                              display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5aab72" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 2px' }}>Precisa de ajuda?</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', margin:'0 0 1px' }}>Entre em contato com nosso suporte</p>
                  <p style={{ fontSize:12, color:'#5aab72', margin:0 }}>suporte@agromind.com.br</p>
                </div>
              </div>
              <ArrowLeft size={15} color="rgba(255,255,255,.25)" style={{ transform:'rotate(180deg)', flexShrink:0 }}/>
            </div>
          </div>

          <p style={{ fontSize:12, color:'rgba(255,255,255,.2)', ...anim(.65) }}>© 2026 AgroMind.</p>
        </div>
      </div>

      {/* ══ DIREITA ══ */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'32px 40px', background:'var(--color-brand-bg)', position:'relative', overflow:'hidden' }}>

        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)',
                      width:400, height:400, borderRadius:'50%', pointerEvents:'none',
                      background:'radial-gradient(circle, rgba(61,122,82,.07) 0%, transparent 70%)',
                      filter:'blur(40px)' }}/>

        <div style={{ position:'absolute', top:24, right:28, ...anim(.05),
                      display:'flex', alignItems:'center', gap:7, padding:'6px 14px',
                      borderRadius:99, background:'rgba(61,122,82,.1)', border:'1px solid rgba(90,171,114,.2)' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#5aab72',
                         animation:'glowPulse 2.5s ease-in-out infinite' }}/>
          <span style={{ fontSize:12, color:'#5aab72', fontWeight:500 }}>Sistema online</span>
        </div>

        <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
          <div style={{ background:'var(--color-brand-surface)', borderRadius:24,
                        border:'1px solid var(--color-brand-border)',
                        boxShadow:'0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.02)',
                        padding:'44px 40px 40px', ...anim(.12) }}>

            {/* Ícone */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:32, ...anim(.18) }}>
              <div style={{ width:88, height:88, borderRadius:'50%', position:'relative',
                            background:'rgba(61,122,82,.1)', border:'1.5px solid rgba(90,171,114,.2)',
                            boxShadow:'0 0 0 8px rgba(61,122,82,.05), 0 16px 40px rgba(0,0,0,.3)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            animation: sent ? 'none' : 'float 5s ease-in-out infinite' }}>
                {sent ? (
                  <CheckCircle size={36} color="#5aab72" style={{ animation:'scaleIn .4s ease both' }}/>
                ) : (
                  <>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#5aab72" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <div style={{ position:'absolute', bottom:-2, right:-2, width:26, height:26,
                                  borderRadius:'50%', background:'var(--color-brand-green)',
                                  border:'2.5px solid var(--color-brand-surface)',
                                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Leaf size={13} color="#fff"/>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!sent ? (
              <>
                <div style={{ textAlign:'center', marginBottom:32, ...anim(.24) }}>
                  <h2 style={{ fontSize:24, fontWeight:800, color:'var(--color-brand-text)',
                               margin:'0 0 8px', letterSpacing:'-.5px' }}>
                    Esqueci minha senha
                  </h2>
                  <p style={{ fontSize:14, color:'var(--color-brand-muted)', margin:0, lineHeight:1.6 }}>
                    Informe seu e-mail cadastrado que enviaremos<br/>um link para redefinir sua senha.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={anim(.30)}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--color-brand-muted)',
                                    letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8 }}>
                      E-mail
                    </label>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
                                    color: focused ? '#5aab72' : 'var(--color-brand-muted)',
                                    transition:'color .2s', display:'flex' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                             placeholder="Digite seu e-mail cadastrado" required
                             style={{ width:'100%', padding:'13px 14px 13px 42px', borderRadius:12, fontSize:14,
                                      background: focused ? '#0f1a0f' : 'var(--color-brand-bg)',
                                      color:'var(--color-brand-text)',
                                      border:`1.5px solid ${focused ? 'var(--color-brand-green)' : 'var(--color-brand-border)'}`,
                                      outline:'none', boxSizing:'border-box', transition:'all .2s ease',
                                      boxShadow: focused ? '0 0 0 4px rgba(61,122,82,.12)' : 'none' }}
                             onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/>
                    </div>
                  </div>

                  <div style={anim(.36)}>
                    <button type="submit" disabled={loading}
                            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                     width:'100%', padding:'14px', borderRadius:13, fontSize:15, fontWeight:700,
                                     background: loading ? 'var(--color-brand-surface-2)' : 'linear-gradient(135deg,#3d7a52,#2d6040)',
                                     color: loading ? 'var(--color-brand-muted)' : '#fff',
                                     border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                                     transition:'all .25s ease',
                                     boxShadow: loading ? 'none' : '0 8px 28px rgba(61,122,82,.35)' }}
                            onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(61,122,82,.45)' }}}
                            onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=loading?'none':'0 8px 28px rgba(61,122,82,.35)' }}>
                      {loading
                        ? <><span style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,.25)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', flexShrink:0 }}/> Enviando...</>
                        : <><Send size={15}/><span>Enviar link de recuperação</span></>}
                    </button>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:14, ...anim(.40) }}>
                    <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
                    <span style={{ fontSize:12, color:'var(--color-brand-muted)' }}>ou</span>
                    <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
                  </div>

                  <div style={anim(.44)}>
                    <button type="button" onClick={()=>navigate('/login')}
                            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                     width:'100%', padding:'13px', borderRadius:13, fontSize:14, fontWeight:500,
                                     background:'var(--color-brand-surface-2)', color:'var(--color-brand-text-2)',
                                     border:'1.5px solid var(--color-brand-border)', cursor:'pointer', transition:'all .2s ease' }}
                            onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(90,171,114,.4)'; e.currentTarget.style.background='rgba(61,122,82,.08)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-1px)' }}
                            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--color-brand-border)'; e.currentTarget.style.background='var(--color-brand-surface-2)'; e.currentTarget.style.color='var(--color-brand-text-2)'; e.currentTarget.style.transform='translateY(0)' }}>
                      <ArrowLeft size={15}/> Voltar para o login
                    </button>
                  </div>

                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', borderRadius:12,
                                background:'rgba(61,122,82,.07)', border:'1px solid rgba(90,171,114,.15)', ...anim(.48) }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'rgba(61,122,82,.2)',
                                  flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Shield size={16} color="#5aab72"/>
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 3px' }}>
                        Não se preocupe, acontece!
                      </p>
                      <p style={{ fontSize:12, color:'var(--color-brand-muted)', margin:0, lineHeight:1.5 }}>
                        Sua conta está segura. Siga as instruções que enviaremos para redefinir sua senha.
                      </p>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* Estado sucesso */
              <div style={{ textAlign:'center', animation:'scaleIn .4s ease both' }}>
                <h2 style={{ fontSize:24, fontWeight:800, color:'var(--color-brand-text)', margin:'0 0 12px', letterSpacing:'-.5px' }}>
                  E-mail enviado! ✉️
                </h2>
                <p style={{ fontSize:14, color:'var(--color-brand-muted)', margin:'0 0 28px', lineHeight:1.7 }}>
                  Enviamos um link de recuperação para<br/>
                  <strong style={{ color:'var(--color-brand-text)' }}>{email}</strong>.<br/>
                  Verifique sua caixa de entrada e spam.
                </p>
                <button onClick={()=>navigate('/login')}
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                 width:'100%', padding:'14px', borderRadius:13, fontSize:15, fontWeight:700,
                                 background:'linear-gradient(135deg,#3d7a52,#2d6040)', color:'#fff',
                                 border:'none', cursor:'pointer', transition:'all .25s ease',
                                 boxShadow:'0 8px 28px rgba(61,122,82,.35)' }}
                        onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(61,122,82,.45)' }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(61,122,82,.35)' }}>
                  <ArrowLeft size={15}/> Voltar para o login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
