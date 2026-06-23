import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { Leaf, LayoutDashboard, Map, CloudSun, TriangleAlert, ClipboardList, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Painel',      sub: 'Visão geral'           },
  { to: '/fazendas',    icon: Map,             label: 'Fazendas',    sub: 'Gerenciar propriedades' },
  { to: '/clima',       icon: CloudSun,        label: 'Clima',       sub: 'Condições meteorológicas'},
  { to: '/alertas',     icon: TriangleAlert,   label: 'Alertas',     sub: 'Monitoramento ativo'    },
  { to: '/diagnostico', icon: ClipboardList,   label: 'Diagnósticos',sub: 'Análises e recomendações'},
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('')
    : '??'
  const firstName = user?.name?.split(' ')[0] ?? 'Usuário'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="flex items-center gap-2 px-4 sticky top-0 z-50 shrink-0"
            style={{
              background: 'var(--color-brand-surface)',
              borderBottom: '1px solid var(--color-brand-border)',
              height: 64,
            }}>
      {/* Logo */}
      <div className="flex items-center gap-2 pr-4 shrink-0"
           style={{ borderRight: '1px solid var(--color-brand-border)' }}>
        <Leaf size={18} style={{ color: 'var(--color-brand-green-light)' }} />
        <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--color-brand-text)' }}>
          AgroMind
        </span>
      </div>

      {/* Nav */}
      <nav className="flex items-stretch gap-0.5 flex-1 h-full">
        {nav.map(({ to, icon: Icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-2.5 px-3 transition-all relative"
            style={({ isActive }) => ({
              background: isActive ? 'rgba(74,124,89,0.15)' : 'transparent',
              color: isActive ? '#fff' : 'var(--color-brand-muted)',
              borderBottom: isActive ? '2px solid var(--color-brand-green-light)' : '2px solid transparent',
            })}
          >
            <Icon size={16} className="shrink-0" style={{ color: 'inherit' }} />
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight" style={{ color: 'var(--color-brand-text)' }}>{label}</span>
              <span className="text-xs leading-tight" style={{ color: 'var(--color-brand-muted)' }}>{sub}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Saudação + avatar */}
      <div className="flex items-center gap-3 pl-4 shrink-0"
           style={{ borderLeft: '1px solid var(--color-brand-border)' }}>
        <div className="text-right">
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-brand-text)' }}>
            {getGreeting()}, {firstName}! 👋
          </p>
          <p className="text-xs leading-tight" style={{ color: 'var(--color-brand-muted)' }}>
            Aqui está o panorama das suas operações
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-1.5"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                 style={{ background: 'var(--color-brand-green)', color: '#fff' }}>
              {initials}
            </div>
            <ChevronDown size={14} style={{ color: 'var(--color-brand-muted)' }} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 rounded-lg shadow-xl py-1 min-w-36 z-50"
                 style={{ background: 'var(--color-brand-surface)', border: '1px solid var(--color-brand-border)' }}>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm"
                style={{ color: 'var(--color-brand-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-muted)'}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
