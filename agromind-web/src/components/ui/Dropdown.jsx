import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { Check } from 'lucide-react'

const DropdownContext = createContext(null)

export function Dropdown({ children, onOpenChange, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const ref = useRef(null)

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      onOpenChange?.(next)
      return next
    })
  }, [onOpenChange])

  const close = useCallback(() => {
    setOpen(false)
    onOpenChange?.(false)
  }, [onOpenChange])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        close()
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') close()
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleKey)
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, close])

  return (
    <DropdownContext.Provider value={{ open, toggle, close }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({ children, asChild = false, className = '' }) {
  const { open, toggle } = useContext(DropdownContext) || {}

  if (asChild) {
    return <div onClick={toggle}>{children}</div>
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 outline-none ${className}`}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {children}
    </button>
  )
}

export function DropdownMenu({
  children,
  className = '',
  align = 'end',
  sideOffset = 4,
}) {
  const { open } = useContext(DropdownContext) || {}

  if (!open) return null

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <div
      className={`absolute z-[1000] mt-${sideOffset} ${alignClasses[align]} min-w-[12rem] origin-top-right rounded-xl border border-border/50 bg-surface/95 p-1.5 shadow-xl backdrop-blur-xl animate-scale-in ${className}`}
      role="menu"
    >
      {children}
    </div>
  )
}

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  rightIcon: RightIcon,
  danger = false,
  disabled = false,
  selected = false,
  className = '',
}) {
  const { close } = useContext(DropdownContext) || {}

  const handleClick = (e) => {
    if (disabled) return
    onClick?.(e)
    close?.()
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors outline-none ${
        danger
          ? 'text-danger hover:bg-danger-soft focus-visible:bg-danger-soft'
          : 'text-ink hover:bg-surface-muted focus-visible:bg-surface-muted'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
    >
      {Icon && <Icon size={16} className="shrink-0 text-muted" />}
      <span className="flex-1">{children}</span>
      {selected && <Check size={14} className="text-primary" />}
      {RightIcon && <RightIcon size={14} className="text-muted" />}
    </button>
  )
}

export function DropdownSeparator({ className = '' }) {
  return <hr className={`my-1 border-border/40 ${className}`} />
}

export function DropdownLabel({ children, className = '' }) {
  return (
    <p
      className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted/60 ${className}`}
    >
      {children}
    </p>
  )
}