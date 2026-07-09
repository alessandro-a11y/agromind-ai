import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

// <Breadcrumb items={[{ label: 'Fazendas', to: '/fazendas' }, { label: 'Fazenda São João' }]} />
export function Breadcrumb({ items = [] }) {
  if (!items.length) return null

  return (
    <nav className="flex items-center gap-1.5 text-[11.5px] text-muted" aria-label="Breadcrumb">
      <Link to="/dashboard" className="flex items-center gap-1 rounded-md p-1 transition-colors hover:text-ink" aria-label="Painel">
        <Home size={13} />
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-muted/50" />
            {isLast || !item.to ? (
              <span className="font-semibold text-ink">{item.label}</span>
            ) : (
              <Link to={item.to} className="transition-colors hover:text-ink">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}