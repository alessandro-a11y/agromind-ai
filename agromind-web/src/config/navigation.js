import {
  Bell,
  Bot,
  ClipboardList,
  CloudSun,
  Home,
  LayoutDashboard,
} from 'lucide-react'

export const NAV_ITEMS = [
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
    desc: 'Consultas',
    icon: Bot,
    accent: 'var(--color-primary)',
  },
]

export const ROUTE_LABELS = Object.fromEntries(NAV_ITEMS.map(item => [item.to, item.label]))

export function getBreadcrumbItems(pathname) {
  const label = ROUTE_LABELS[pathname]
  if (!label || pathname === '/dashboard') return []
  return [{ label }]
}
