import { useMemo, useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '../../store/ErrorBoundary'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { getBreadcrumbItems, NAV_ITEMS } from '../../config/navigation'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { pathname } = useLocation()

  const pageTitle = useMemo(
    () => NAV_ITEMS.find(nav => nav.to === pathname)?.label ?? 'Painel',
    [pathname]
  )

  const breadcrumbItems = useMemo(() => getBreadcrumbItems(pathname), [pathname])

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  useEffect(() => {
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div className="flex min-h-screen bg-canvas text-ink antialiased">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        onCloseMobile={closeMobileMenu}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          pageTitle={pageTitle}
          breadcrumbItems={breadcrumbItems}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div key={pathname} className="mx-auto max-w-7xl dashboard-fade-in">
            <ErrorBoundary key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
