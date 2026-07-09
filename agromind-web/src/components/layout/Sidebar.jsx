import { memo } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Bell,
  Bot,
  ClipboardList,
  CloudSun,
  Home,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from 'lucide-react'
import { Logo } from '../ui/Logo'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Painel',
    desc: 'Visão geral',
    icon: LayoutDashboard,
    accent: 'var(--color-primary)',
  },
  {
    to: '/fazendas',
    label: 'Fazendas',
    desc: 'Propriedades',
    icon: Home,
    accent: '#0d9488',
  },
  {
    to: '/clima',
    label: 'Clima',
    desc: 'Meteorologia',
    icon: CloudSun,
    accent: '#38bdf8',
  },
  {
    to: '/alertas',
    label: 'Alertas',
    desc: 'Monitoramento',
    icon: Bell,
    accent: '#f97316',
    dot: true,
  },
  {
    to: '/diagnostico',
    label: 'Diagnósticos',
    desc: 'Análises',
    icon: ClipboardList,
    accent: '#a78bfa',
  },
  {
    to: '/chat',
    label: 'Assistente IA',
    desc: 'Consultas inteligentes',
    icon: Bot,
    accent: 'var(--color-primary)',
  },
]

const SidebarLink = memo(({ to, label, desc, icon: Icon, accent, dot, collapsed, onNavigate }) => {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isActive
            ? 'bg-primary-soft text-primary'
            : 'text-muted hover:bg-surface-muted hover:text-ink'
        } ${collapsed ? 'justify-center px-2' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-glow" />
          )}
          <span
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
              collapsed ? 'h-9 w-9' : ''
            }`}
            style={{
              backgroundColor: isActive ? 'rgba(79,226,136,0.18)' : `${accent}12`,
              color: isActive ? 'var(--color-primary)' : accent,
            }}
          >
            <Icon size={16} />
            {dot && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface animate-pulse" />
            )}
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[13px] font-semibold">{label}</span>
              <span className="truncate text-[10.5px] text-muted/70">{desc}</span>
            </span>
          )}
        </>
      )}
    </NavLink>
  )
})

SidebarLink.displayName = 'SidebarLink'

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/50 bg-surface/90 backdrop-blur-2xl transition-all duration-300 ease-out lg:sticky lg:top-0 lg:z-30 lg:h-screen ${
          collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div
          className={`flex h-[var(--navbar-height)] shrink-0 items-center border-b border-border/40 px-3 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <Logo size={24} variant="full" />
          ) : (
            <Logo size={26} variant="icon" />
          )}

          {!collapsed && (
            <button
              type="button"
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
              onClick={onToggleCollapse}
              aria-label="Recolher sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          )}

          {collapsed && (
            <button
              type="button"
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
              onClick={onToggleCollapse}
              aria-label="Expandir sidebar"
            >
              <PanelLeftOpen size={15} />
            </button>
          )}

          <button
            type="button"
            className="absolute right-2 top-3 flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
            onClick={onCloseMobile}
            aria-label="Fechar menu"
          >
            <X size={17} />
          </button>
        </div>

        {!collapsed && (
          <div className="shrink-0 px-3 pt-3">
            <div className="flex w-full items-center gap-2 rounded-lg border border-border/50 bg-surface-muted/50 px-3 py-2 text-xs text-muted/60 transition-colors hover:border-border hover:text-muted">
              <Search size={14} />
              <span>Buscar...</span>
              <span className="ml-auto rounded border border-border/30 px-1.5 py-0.5 text-[10px] font-mono text-muted/40">
                ⌘K
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/50">
              Navegação
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <SidebarLink
                key={item.to}
                {...item}
                collapsed={collapsed}
                onNavigate={onCloseMobile}
              />
            ))}
          </div>
        </nav>

        {!collapsed && (
          <div className="shrink-0 border-t border-border/40 p-3">
            <div className="rounded-xl border border-border/40 bg-gradient-to-br from-surface-muted/80 to-surface-muted/30 px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm">
                  🌾
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink">AgroMind AI</p>
                  <p className="truncate text-[10px] text-muted/60">
                    v2.0 • Gestão inteligente
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}