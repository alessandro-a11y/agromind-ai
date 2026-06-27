import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Shield, TrendingUp, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react'

const features = [
  { icon: Shield,     title: 'Seguro e confiável',          desc: 'Seus dados estão protegidos com criptografia de ponta a ponta.'              },
  { icon: Leaf,       title: 'Tecnologia para o campo',     desc: 'Soluções inteligentes para otimizar sua produção agrícola.'                  },
  { icon: TrendingUp, title: 'Insights que geram resultados',desc: 'Transforme dados em decisões estratégicas e aumente sua produtividade.'     },
]

export default function ForgotPassword() {
  const navigate    = useNavigate()
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'var(--font-sans)' }}>

      {/* Esquerda */}
      <div style={{ width:'45%', position:'relative', overflow:'hidden',
                    background:'linear-gradient(135deg,#0a1a0a,#0f2a0f,#1a3a1a)' }}>
        <div style={{ position:'absolute', inset:0,
                      backgroundImage:`url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80')`,
                      backgroundSize:'cover', backgroundPosition:'center', opacity:.3 }}/>
        <div style={{ position:'absolute', inset:0,
                      background:'linear-gradient(to right,rgba(10,26,10,.8),rgba(10,26,10,.45))' }}/>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.12 }}
             viewBox="0 0 500 900" xmlns="http://www.w3.org/2000/svg">
          {[[80,150],[180,300],[320,200],[420,380],[280,480],[120,580],[460,520],[220,680]].map(([x,y],i,arr)=>
            arr.slice(i+1,i+3).map(([x2,y2],j)=>(
              <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#4a7c59" strokeWidth=".8"/>
            ))
          )}
          {[[80,150],[180,300],[320,200],[420,380],[280,480],[120,580],[460,520],[220,680]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="4" fill="#6aab7a"/>
          ))}
        </svg>

        <div style={{ position:'relative', zIndex:10, padding:'48px 44px', height:'100%',
                      display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(74,124,89,.3)',
                          border:'1px solid rgba(106,171,122,.4)',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Leaf size={18} color="#6aab7a"/>
            </div>
            <span style={{ fontSize:18, fontWeight:700, color:'#fff' }}>AgroMind</span>
          </div>

          <div>
            <h1 style={{ fontSize:44, fontWeight:800, color:'#fff', letterSpacing:'-1px', margin:'0 0 8px' }}>Inteligência</h1>
            <h1 style={{ fontSize:44, fontWeight:800, color:'#6aab7a', letterSpacing:'-1px', margin:'0 0 20px' }}>para o campo.</h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.6)', lineHeight:1.7, maxWidth:340, margin:'0 0 36px' }}>
              Recupere o acesso à sua conta e continue tomando{' '}
              <span style={{ color:'#6aab7a', fontWeight:600 }}>decisões mais inteligentes</span>{' '}
              para a sua produção.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {features.map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px',
                                      borderRadius:12, background:'rgba(255,255,255,.05)',
                                      border:'1px solid rgba(255,255,255,.08)' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(74,124,89,.25)',
                                border:'1px solid rgba(106,171,122,.3)', flexShrink:0,
                                display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <f.icon size={15} color="#6aab7a"/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 2px' }}>{f.title}</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', margin:0, lineHeight:1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Card suporte */}
            <div style={{ marginTop:20, display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,.05)',
                          border:'1px solid rgba(255,255,255,.08)', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(74,124,89,.25)',
                              border:'1px solid rgba(106,171,122,.3)',
                              display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6aab7a" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 2px' }}>Precisa de ajuda?</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', margin:'0 0 2px' }}>Entre em contato com nosso suporte</p>
                  <p style={{ fontSize:12, color:'#6aab7a', margin:0 }}>suporte@agromind.com.br</p>
                </div>
              </div>
              <ArrowLeft size={16} color="rgba(255,255,255,.3)" style={{ transform:'rotate(180deg)' }}/>
            </div>
          </div>

          <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', margin:0 }}>© 2026 AgroMind.</p>
        </div>
      </div>

      {/* Direita */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'32px', background:'var(--color-brand-bg)', position:'relative' }}>

        <div style={{ position:'absolute', top:24, right:24, display:'flex', alignItems:'center', gap:6,
                      padding:'5px 12px', borderRadius:20, background:'rgba(74,124,89,.15)',
                      border:'1px solid rgba(106,171,122,.3)' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#6aab7a',
                         display:'inline-block', boxShadow:'0 0 6px #6aab7a' }}/>
          <span style={{ fontSize:12, color:'#6aab7a', fontWeight:500 }}>Sistema online</span>
        </div>

        <div style={{ width:'100%', maxWidth:440, background:'var(--color-brand-surface)',
                      border:'1px solid var(--color-brand-border)', borderRadius:20,
                      padding:'36px', boxShadow:'0 24px 64px rgba(0,0,0,.4)' }}>

          {/* Ícone */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(74,124,89,.15)',
                          border:'2px solid rgba(106,171,122,.35)',
                          display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6aab7a" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <div style={{ position:'absolute', bottom:-2, right:-2, width:24, height:24, borderRadius:'50%',
                            background:'var(--color-brand-green)', border:'2px solid var(--color-brand-surface)',
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Leaf size={12} color="#fff"/>
              </div>
            </div>
          </div>

          {!sent ? (
            <>
              <h2 style={{ fontSize:22, fontWeight:700, color:'var(--color-brand-text)',
                           textAlign:'center', margin:'0 0 8px' }}>Esqueci minha senha</h2>
              <p style={{ fontSize:13, color:'var(--color-brand-muted)', textAlign:'center',
                          margin:'0 0 28px', lineHeight:1.6 }}>
                Informe seu e-mail cadastrado que enviaremos<br/>um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--color-brand-muted)',
                                  letterSpacing:'1.5px', textTransform:'uppercase', display:'block', marginBottom:6 }}>
                    E-mail
                  </label>
                  <div style={{ position:'relative' }}>
                    <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                                  color:'var(--color-brand-muted)', display:'flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                           placeholder="Digite seu e-mail cadastrado" required
                           style={{ width:'100%', padding:'11px 14px 11px 36px', borderRadius:10, fontSize:14,
                                    background:'var(--color-brand-bg)', color:'var(--color-brand-text)',
                                    border:'1px solid var(--color-brand-border)', outline:'none',
                                    boxSizing:'border-box', transition:'border-color .2s' }}
                           onFocus={e=>e.target.style.borderColor='var(--color-brand-green)'}
                           onBlur={e=>e.target.style.borderColor='var(--color-brand-border)'}/>
                  </div>
                </div>

                {error && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:8,
                                background:'rgba(192,57,43,.1)', border:'1px solid rgba(192,57,43,.3)',
                                color:'#f87171', fontSize:13 }}>
                    <AlertCircle size={14}/> {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                 padding:'13px', borderRadius:10, fontSize:15, fontWeight:700,
                                 background: loading?'var(--color-brand-border)':'var(--color-brand-green)',
                                 color: loading?'var(--color-brand-muted)':'#fff',
                                 border:'none', cursor: loading?'not-allowed':'pointer', transition:'all .2s' }}>
                  {loading ? 'Enviando...' : <><Send size={15}/><span>Enviar link de recuperação</span></>}
                </button>

                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
                  <span style={{ fontSize:12, color:'var(--color-brand-muted)' }}>ou</span>
                  <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
                </div>

                <button type="button" onClick={()=>navigate('/login')}
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                 padding:'12px', borderRadius:10, fontSize:14, fontWeight:500,
                                 background:'var(--color-brand-bg)', color:'var(--color-brand-text)',
                                 border:'1px solid var(--color-brand-border)', cursor:'pointer', transition:'all .2s' }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-brand-green)'}
                        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-brand-border)'}>
                  <ArrowLeft size={15}/> Voltar para o login
                </button>

                {/* Card segurança */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px',
                              borderRadius:10, background:'rgba(74,124,89,.08)',
                              border:'1px solid rgba(106,171,122,.2)' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:'rgba(74,124,89,.2)',
                                flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Shield size={16} color="#6aab7a"/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--color-brand-text)', margin:'0 0 2px' }}>
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
            /* Estado de sucesso */
            <div style={{ textAlign:'center' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(74,124,89,.2)',
                              border:'2px solid #6aab7a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <CheckCircle size={28} color="#6aab7a"/>
                </div>
              </div>
              <h2 style={{ fontSize:22, fontWeight:700, color:'var(--color-brand-text)', margin:'0 0 8px' }}>
                E-mail enviado!
              </h2>
              <p style={{ fontSize:13, color:'var(--color-brand-muted)', margin:'0 0 24px', lineHeight:1.6 }}>
                Enviamos um link de recuperação para<br/>
                <strong style={{ color:'var(--color-brand-text)' }}>{email}</strong>.<br/>
                Verifique sua caixa de entrada e spam.
              </p>
              <button onClick={()=>navigate('/login')}
                      style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                               width:'100%', padding:'13px', borderRadius:10, fontSize:15, fontWeight:700,
                               background:'var(--color-brand-green)', color:'#fff',
                               border:'none', cursor:'pointer' }}>
                <ArrowLeft size={15}/> Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
