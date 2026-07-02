import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Bell, Bot, CloudSun, ClipboardList, Home, LayoutDashboard, Leaf, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../store/AuthContext'
import { Button } from '../ui/Primitives'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fazendas', label: 'Fazendas', icon: Home },
  { to: '/clima', label: 'Clima', icon: CloudSun },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/diagnostico', label: 'Diagnostico', icon: ClipboardList },
  { to: '/chat', label: 'Assistente', icon: Bot },
]

function NavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      key={to}
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `nav-pill flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-primary-soft text-primary shadow-sm' : 'text-muted hover:bg-surface-muted hover:text-ink'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const pageTitle = useMemo(() => {
    const item = navItems.find(nav => nav.to === pathname)
    return item?.label ?? 'Dashboard'
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-surface/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(value => !value)} aria-label="Abrir menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-slate-950 shadow-lg shadow-primary/30">
                <Leaf size={18} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-extrabold tracking-[-0.02em] text-ink">AgroMind</p>
                <p className="text-xs text-muted/80">AI para agronômia</p>
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-1.5 lg:flex">
            {navItems.map(item => <NavItem key={item.to} {...item} onNavigate={() => setMenuOpen(false)} />)}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-3 rounded-full border border-border/50 bg-surface-muted/70 px-4 py-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary-strong/30 text-xs font-extrabold text-primary">
                {(user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">{user?.name?.split(' ')[0] ?? 'Usuário'}</p>
                <p className="text-xs text-muted">Conta autenticada</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border/50 bg-surface/95 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map(item => <NavItem key={item.to} {...item} onNavigate={() => setMenuOpen(false)} />)}
              <button className="nav-pill flex items-center justify-start gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-ink" onClick={handleLogout}>
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-surface/70 px-4 py-3 shadow-sm md:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Página atual</p>
            <h1 className="text-sm font-bold text-ink">{pageTitle}</h1>
          </div>
          <div className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Ativo</div>
        </div>

        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
