import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, AlertCircle, ArrowRight, TrendingUp, Shield, CloudRain, Lock } from 'lucide-react'
import api from '../services/api'

const features = [
  { icon: TrendingUp, title: 'Dados em tempo real',        desc: 'Monitore o clima, o solo e suas lavouras em tempo real.'                },
  { icon: Shield,     title: 'Decisões mais assertivas',   desc: 'Receba insights e recomendações para aumentar sua produtividade.'       },
  { icon: CloudRain,  title: 'Previsões e alertas',        desc: 'Antecipe eventos climáticos e reduza riscos na sua produção.'           },
  { icon: Lock,       title: 'Segurança e confiabilidade', desc: 'Seus dados protegidos com criptografia avançada e backup automático.'   },
  { icon: Leaf,       title: null,                         desc: 'Junte-se a agricultores que já estão colhendo os resultados da tecnologia.' },
]

function getStrength(pwd) {
  if (!pwd) return { score:0, label:'', color:'' }
  let s = 0
  if (pwd.length >= 8)           s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  const m = [
    { label:'',       color:'' },
    { label:'Fraca',  color:'#c0392b' },
    { label:'Média',  color:'#c9933a' },
    { label:'Boa',    color:'#4a9fbf' },
    { label:'Forte',  color:'#4a7c59' },
  ]
  return { score:s, ...m[s] }
}

const inputBase = {
  width:'100%', padding:'11px 42px 11px 36px', borderRadius:10, fontSize:14,
  background:'var(--color-brand-bg)', color:'var(--color-brand-text)',
  border:'1px solid var(--color-brand-border)', outline:'none',
  boxSizing:'border-box', transition:'border-color .2s',
}

function Field({ label, type, value, onChange, placeholder, showToggle, show, onToggle, borderOverride }) {
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:600, color:'var(--color-brand-muted)',
                      letterSpacing:'1.5px', textTransform:'uppercase', display:'block', marginBottom:6 }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                      color:'var(--color-brand-muted)', display:'flex' }}>
          {type === 'email'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            : type === 'text'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          }
        </div>
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value} onChange={onChange} placeholder={placeholder} required
          style={{ ...inputBase, ...(borderOverride ? { borderColor: borderOverride } : {}) }}
          onFocus={e => e.target.style.borderColor = borderOverride || 'var(--color-brand-green)'}
          onBlur={e  => e.target.style.borderColor = borderOverride || 'var(--color-brand-border)'}
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                           background:'none', border:'none', cursor:'pointer',
                           color:'var(--color-brand-muted)', display:'flex' }}>
            {show ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [nome,     setNome]     = useState('')
  const [email,    setEmail]    = useState('')
  const [senha,    setSenha]    = useState('')
  const [confirma, setConfirma] = useState('')
  const [showP,    setShowP]    = useState(false)
  const [showC,    setShowC]    = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const strength = getStrength(senha)
  const mismatch = confirma && confirma !== senha

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (senha !== confirma)   { setError('As senhas não coincidem.'); return }
    if (strength.score < 2)   { setError('Crie uma senha mais forte.'); return }
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
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'var(--font-sans)' }}>

      {/* Esquerda */}
      <div style={{ width:'45%', position:'relative', overflow:'hidden',
                    background:'linear-gradient(135deg,#0a1a0a,#0f2a0f,#1a3a1a)' }}>
        <div style={{ position:'absolute', inset:0,
                      backgroundImage:`url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80')`,
                      backgroundSize:'cover', backgroundPosition:'center', opacity:.3 }}/>
        <div style={{ position:'absolute', inset:0,
                      background:'linear-gradient(to right,rgba(10,26,10,.75),rgba(10,26,10,.45))' }}/>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.12 }}
             viewBox="0 0 500 900" xmlns="http://www.w3.org/2000/svg">
          {[[80,150],[180,300],[320,200],[420,380],[280,480],[120,580],[460,520],[220,680],[350,750]].map(([x,y],i,arr)=>
            arr.slice(i+1,i+3).map(([x2,y2],j)=>(
              <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#4a7c59" strokeWidth=".8"/>
            ))
          )}
          {[[80,150],[180,300],[320,200],[420,380],[280,480],[120,580],[460,520],[220,680],[350,750]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="4" fill="#6aab7a"/>
          ))}
        </svg>
        <div style={{ position:'relative', zIndex:10, padding:'48px 44px', height:'100%',
                      display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(74,124,89,.3)',
                          border:'1px solid rgba(106,171,122,.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Leaf size={18} color="#6aab7a"/>
            </div>
            <span style={{ fontSize:18, fontWeight:700, color:'#fff' }}>AgroMind</span>
          </div>
          <div>
            <h1 style={{ fontSize:44, fontWeight:800, color:'#fff', letterSpacing:'-1px', margin:'0 0 8px' }}>Inteligência</h1>
            <h1 style={{ fontSize:44, fontWeight:800, color:'#6aab7a', letterSpacing:'-1px', margin:'0 0 20px' }}>para o campo.</h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.6)', lineHeight:1.7, maxWidth:340, margin:'0 0 36px' }}>
              Crie sua conta e comece a transformar dados em{' '}
              <span style={{ color:'#6aab7a', fontWeight:600 }}>decisões mais inteligentes</span>{' '}
              para a sua produção agrícola.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
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
                    {f.title && <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 2px' }}>{f.title}</p>}
                    <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', margin:0, lineHeight:1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', margin:0 }}>© 2026 AgroMind.</p>
        </div>
      </div>

      {/* Direita */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'32px', background:'var(--color-brand-bg)', overflowY:'auto', position:'relative' }}>
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

          <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(74,124,89,.15)',
                          border:'2px solid rgba(106,171,122,.35)',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Leaf size={32} color="#6aab7a"/>
            </div>
          </div>

          <h2 style={{ fontSize:22, fontWeight:700, color:'var(--color-brand-text)',
                       textAlign:'center', margin:'0 0 6px' }}>Criar conta</h2>
          <p style={{ fontSize:13, color:'var(--color-brand-muted)', textAlign:'center', margin:'0 0 24px' }}>
            Preencha os dados abaixo para começar
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="Nome completo"   type="text"     value={nome}     onChange={e=>setNome(e.target.value)}     placeholder="Digite seu nome completo"/>
            <Field label="E-mail"          type="email"    value={email}    onChange={e=>setEmail(e.target.value)}    placeholder="Digite seu melhor e-mail"/>
            <Field label="Senha"           type="password" value={senha}    onChange={e=>setSenha(e.target.value)}    placeholder="Crie uma senha forte"
                   showToggle show={showP} onToggle={()=>setShowP(s=>!s)}/>

            {senha && (
              <div style={{ marginTop:-8 }}>
                <div style={{ display:'flex', gap:4, marginBottom:5 }}>
                  {[1,2,3,4].map(i=>(
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, transition:'background .3s',
                                          background: i<=strength.score ? strength.color : 'var(--color-brand-border)' }}/>
                  ))}
                </div>
                <p style={{ fontSize:11, color: strength.score<2 ? 'var(--color-brand-muted)' : strength.color, margin:0 }}>
                  {strength.score < 2
                    ? 'Use pelo menos 8 caracteres com letra maiúscula, número e símbolo.'
                    : `Força da senha: ${strength.label}`}
                </p>
              </div>
            )}

            <Field label="Confirmar senha" type="password" value={confirma} onChange={e=>setConfirma(e.target.value)} placeholder="Confirme sua senha"
                   showToggle show={showC} onToggle={()=>setShowC(s=>!s)}
                   borderOverride={mismatch ? '#c0392b' : undefined}/>

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:8,
                            background:'rgba(192,57,43,.1)', border:'1px solid rgba(192,57,43,.3)',
                            color:'#f87171', fontSize:13 }}>
                <AlertCircle size={14}/> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                             padding:'13px', borderRadius:10, fontSize:15, fontWeight:700, marginTop:4,
                             background: loading ? 'var(--color-brand-border)' : 'var(--color-brand-green)',
                             color: loading ? 'var(--color-brand-muted)' : '#fff',
                             border:'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Criando conta...' : <><span>Criar conta</span><ArrowRight size={16}/></>}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
              <span style={{ fontSize:12, color:'var(--color-brand-muted)' }}>ou cadastre-se com</span>
              <div style={{ flex:1, height:1, background:'var(--color-brand-border)' }}/>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[{label:'Google',logo:'https://www.google.com/favicon.ico'},{label:'Microsoft',logo:'https://www.microsoft.com/favicon.ico'}].map(s=>(
                <button key={s.label} type="button"
                        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                                 padding:'10px', borderRadius:10, fontSize:13, fontWeight:500,
                                 background:'var(--color-brand-bg)', color:'var(--color-brand-text)',
                                 border:'1px solid var(--color-brand-border)', cursor:'pointer' }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-brand-green)'}
                        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-brand-border)'}>
                  <img src={s.logo} width={16} height={16} alt={s.label}/> {s.label}
                </button>
              ))}
            </div>

            <p style={{ textAlign:'center', fontSize:13, color:'var(--color-brand-muted)', margin:0 }}>
              Já tem uma conta?{' '}
              <button type="button" onClick={()=>navigate('/login')}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                               fontSize:13, color:'var(--color-brand-green-light)', fontWeight:600 }}>
                Entrar
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
