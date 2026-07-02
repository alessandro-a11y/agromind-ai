import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Bell, Bot, CloudSun, ClipboardList, Home, LayoutDashboard, Leaf, LogOut, Menu } from 'lucide-react'
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

function Sidebar({ mobile = false, onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className={`flex h-full flex-col border-r border-border bg-white ${mobile ? 'w-72' : 'w-64'}`}>
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
          <Leaf size={18} />
        </div>
        <div>
          <p className="text-sm font-extrabold text-ink">AgroMind AI</p>
          <p className="text-xs text-muted">Operacoes agricolas</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-muted hover:text-ink'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-3 rounded-md bg-surface-muted px-3 py-2">
          <p className="truncate text-sm font-bold text-ink">{user?.name ?? 'Usuario'}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut size={16} /> Sair
        </Button>
      </div>
    </aside>
  )
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  const pageTitle = useMemo(() => {
    const item = navItems.find(nav => nav.to === pathname)
    return item?.label ?? 'Dashboard'
  }, [pathname])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[800] lg:hidden">
          <button className="absolute inset-0 bg-slate-950/35" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />
          <div className="relative h-full">
            <Sidebar mobile onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <Menu size={18} />
            </Button>
            <div>
              <h1 className="text-base font-extrabold text-ink md:text-lg">{pageTitle}</h1>
              <p className="hidden text-xs text-muted sm:block">Ambiente corporativo de monitoramento e decisao agricola</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-ink">{user?.name?.split(' ')[0] ?? 'Usuario'}</p>
              <p className="text-xs text-muted">Conta autenticada</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary">
              {(user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] p-4 md:p-6">
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
