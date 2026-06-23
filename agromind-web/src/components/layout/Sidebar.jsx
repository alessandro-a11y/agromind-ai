import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import {
  Leaf, LayoutDashboard, Map, CloudSun,
  TriangleAlert, ClipboardList, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/fazendas',     icon: Map,             label: 'Fazendas'     },
  { to: '/clima',        icon: CloudSun,        label: 'Clima'        },
  { to: '/alertas',      icon: TriangleAlert,   label: 'Alertas'      },
  { to: '/diagnostico',  icon: ClipboardList,   label: 'Diagnóstico'  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? 64 : 220,
        background: 'var(--color-brand-surface)',
        borderRight: '1px solid var(--color-brand-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5"
           style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Leaf size={18} style={{ color: 'var(--color-brand-green-light)' }} />
            <span className="font-semibold text-sm tracking-wide"
                  style={{ color: 'var(--color-brand-text)' }}>AgroMind</span>
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--color-brand-muted)' }}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-brand-green)' : 'transparent',
              color: isActive ? '#fff' : 'var(--color-brand-muted)',
              fontWeight: isActive ? 500 : 400,
            })}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer — usuário */}
      <div className="p-2" style={{ borderTop: '1px solid var(--color-brand-border)' }}>
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--color-brand-text)' }}>
              {user.name ?? user.email}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-brand-muted)' }}>
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: 'var(--color-brand-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-muted)'}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}
