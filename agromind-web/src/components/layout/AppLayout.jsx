import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Bell, Bot, ChevronDown, CloudSun, ClipboardList, Home, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../store/AuthContext'
import { Button } from '../ui/Primitives'
import { Logo } from '../ui/Logo'

const navItems = [
  { to: '/dashboard', label: 'Painel', desc: 'Visão geral', icon: LayoutDashboard, accent: '#22c55e' },
  { to: '/fazendas', label: 'Fazendas', desc: 'Gerenciar propriedades', icon: Home, accent: '#0d9488' },
  { to: '/clima', label: 'Clima', desc: 'Condições meteorológicas', icon: CloudSun, accent: '#38bdf8' },
  { to: '/alertas', label: 'Alertas', desc: 'Monitoramento ativo', icon: Bell, accent: '#f97316', dot: true },
  { to: '/diagnostico', label: 'Diagnósticos', desc: 'Análises e recomendações', icon: ClipboardList, accent: '#a78bfa' },
  { to: '/chat', label: 'Assistente IA', desc: 'Consultas inteligentes', icon: Bot, accent: '#22c55e' },
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function NavItem({ to, label, desc, icon: Icon, accent, dot, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2 whitespace-nowrap rounded-xl px-2.5 py-1.5 transition ${
          isActive ? 'bg-primary-soft' : 'hover:bg-surface-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: isActive ? 'rgba(34,197,94,0.18)' : `${accent}22`,
              color: isActive ? '#22c55e' : accent,
            }}
          >
            <Icon size={14} />
            {dot && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface" />
            )}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[12.5px] font-semibold text-ink">{label}</span>
            <span className="hidden text-[10px] text-muted/80 2xl:block">{desc}</span>
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const pageTitle = useMemo(() => {
    const item = navItems.find(nav => nav.to === pathname)
    return item?.label ?? 'Painel'
  }, [pathname])

  const firstName = user?.name?.split(' ')[0] ?? 'Usuário'
  const initials = (user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-surface/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1920px] items-center gap-2 px-4 md:px-6 xl:px-8">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2.5">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(value => !value)} aria-label="Abrir menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <Logo size={28} variant="full" />
          </div>

          {/* Nav */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map(item => <NavItem key={item.to} {...item} onNavigate={() => setMenuOpen(false)} />)}
          </nav>

          {/* Usuário */}
          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <div className="hidden max-w-[220px] text-right xl:block">
              <p className="truncate text-sm font-bold text-ink leading-tight">{greeting()}, {firstName}! 👋</p>
              <p className="truncate text-[11px] text-muted/80 leading-none mt-0.5">Aqui está o panorama das suas operações</p>
            </div>
            <div className="hidden text-right sm:block xl:hidden">
              <p className="whitespace-nowrap text-sm font-bold text-ink leading-tight">{greeting()}, {firstName}! 👋</p>
            </div>
            <div className="relative">
              <button className="flex shrink-0 items-center gap-1 rounded-full pl-0.5 pr-1 hover:bg-surface-muted transition" onClick={() => setUserMenuOpen(v => !v)} aria-label="Menu do usuário">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary-strong/30 text-xs font-extrabold text-primary">
                {initials}
              </span>
              <ChevronDown size={14} className="text-muted" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border/50 bg-surface/95 shadow-lg">
                  <div className="flex flex-col py-2">
                    <button className="text-left px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => { navigate('/perfil'); setUserMenuOpen(false) }}>Perfil</button>
                    <button className="text-left px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => { handleLogout() }}>Sair</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border/50 bg-surface/95 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                      isActive ? 'bg-primary-soft' : 'hover:bg-surface-muted'
                    }`
                  }
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.accent}22`, color: item.accent }}
                  >
                    <item.icon size={15} />
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[13px] font-semibold text-ink">{item.label}</span>
                    <span className="text-[10.5px] text-muted/80">{item.desc}</span>
                  </span>
                </NavLink>
              ))}
              <button className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-ink" onClick={handleLogout}>
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