import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-brand-bg)' }}>
      <Topbar />
      <main className="flex-1" style={{ overflow: "hidden" }}>
        <Outlet />
      </main>
      <footer className="text-center py-3 text-xs" style={{ color: 'var(--color-brand-muted)', borderTop: '1px solid var(--color-brand-border)' }}>
        © 2024 AgroMind. Todos os direitos reservados.
        <span className="float-right pr-6">Versão 1.0.0</span>
      </footer>
    </div>
  )
}
