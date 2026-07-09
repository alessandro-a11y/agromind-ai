import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'
import { Heart } from 'lucide-react'
import { NAV_ITEMS } from '../../config/navigation'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/30 bg-surface/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        {/* Left: Logo + copyright */}
        <div className="flex items-center gap-3">
          <Logo size={18} variant="full" className="opacity-60" />
          <span className="hidden text-[11px] text-muted/50 sm:inline">
            © {year} AgroMind AI
          </span>
        </div>

        {/* Center: Navigation links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[11.5px] text-muted/60 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://github.com/alessandro-a11y/agromind-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11.5px] text-muted/60 transition-colors hover:text-ink"
          >
            GitHub
          </a>
        </nav>

        {/* Right: Made with */}
        <p className="flex items-center gap-1 text-[11px] text-muted/50">
          Feito com <Heart size={10} className="text-danger" /> para o agronegócio
        </p>

        {/* Mobile copyright */}
        <p className="text-[11px] text-muted/50 sm:hidden">
          © {year} AgroMind AI
        </p>
      </div>
    </footer>
  )
}