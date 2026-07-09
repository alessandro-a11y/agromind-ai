import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Moon, Settings, User, Sun } from 'lucide-react'
import { useAuth } from '../../store/AuthContext'
import { Button } from '../ui/Button'
import { Breadcrumb } from '../Breadcrumb'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function Navbar({ pageTitle, breadcrumbItems, onOpenMobileMenu }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const userMenuRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const greetingText = useMemo(() => getGreeting(), [])
  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Usuário', [user?.name])
  const initials = useMemo(
    () => (user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase(),
    [user?.name, user?.email]
  )

  const handleLogout = useCallback(async () => {
    setUserMenuOpen(false)
    await logout()
    navigate('/login')
  }, [logout, navigate])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <header className="sticky top-0 z-20 flex h-[var(--navbar-height)] shrink-0 items-center gap-4 border-b border-border/50 bg-canvas/70 px-4 backdrop-blur-2xl sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden shrink-0"
        onClick={onOpenMobileMenu}
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </Button>

      {/* Page title + breadcrumb */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="truncate text-base font-bold text-ink sm:text-lg">{pageTitle}</h1>
      </div>

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
          aria-label="Notificações"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-canvas" />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Greeting */}
        <div className="hidden text-right md:block">
          <p className="truncate text-sm font-semibold text-ink">
            {greetingText}, {firstName}
          </p>
          <p className="hidden text-[11px] text-muted/60 xl:block">Panorama das suas operações</p>
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-1 transition-colors outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary/40"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-label="Menu do usuário"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/25 to-primary-strong/20 text-xs font-extrabold text-primary shadow-sm">
              {initials}
            </span>
            <ChevronDown
              size={14}
              className={`hidden text-muted transition-transform duration-200 sm:block ${
                userMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border/50 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-scale-in"
              role="menu"
            >
              {/* User info */}
              <div className="border-b border-border/40 px-3 py-2.5">
                <p className="text-sm font-bold text-ink">{user?.name ?? 'Usuário'}</p>
                <p className="truncate text-xs text-muted">{user?.email ?? ''}</p>
              </div>

              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
                  onClick={() => {
                    navigate('/perfil')
                    setUserMenuOpen(false)
                  }}
                >
                  <User size={15} className="text-muted" />
                  Perfil
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
                  onClick={() => {
                    navigate('/configuracoes')
                    setUserMenuOpen(false)
                  }}
                >
                  <Settings size={15} className="text-muted" />
                  Configurações
                </button>
              </div>

              <hr className="my-1 border-border/40" />

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}