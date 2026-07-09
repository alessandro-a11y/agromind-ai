import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const variantStyles = {
  primary:
    'bg-gradient-to-br from-primary to-primary-strong text-slate-950 shadow-lg shadow-primary/20 hover:from-primary-strong hover:to-primary hover:shadow-xl hover:shadow-primary/30 active:shadow-primary/10',
  secondary:
    'bg-surface text-ink border border-border hover:bg-surface-muted hover:border-border-hover active:bg-surface-elevated',
  ghost:
    'bg-transparent text-muted hover:bg-surface-muted hover:text-ink active:bg-surface-elevated',
  danger:
    'bg-danger text-white shadow-lg shadow-danger/20 hover:bg-red-500 active:bg-red-600',
  outline:
    'bg-transparent text-primary border border-primary/30 hover:bg-primary-soft active:bg-primary/25',
  'outline-light':
    'bg-transparent text-ink border border-border hover:bg-surface-muted hover:border-border-hover',
}

const sizeStyles = {
  xs: 'h-7 px-2.5 text-[11px] rounded-md gap-1.5',
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  xl: 'h-14 px-8 text-lg rounded-xl gap-3',
  icon: 'h-9 w-9 p-0 rounded-lg',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg',
  'icon-xs': 'h-7 w-7 p-0 rounded-md',
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    children,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 13 : 15} className="animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      ) : null}
      {children && <span>{children}</span>}
      {!loading && RightIcon && (
        <RightIcon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      )}
    </button>
  )
})