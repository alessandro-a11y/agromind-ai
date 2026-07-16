import { forwardRef } from 'react'

const tones = {
  neutral: 'bg-surface-muted text-muted border-white/5',
  success: 'bg-primary-soft text-primary border-primary/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-info-soft text-info border-info/20',
}

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-[11px]',
  lg: 'px-3 py-1 text-[12px]',
}

export const Badge = forwardRef(function Badge(
  { tone = 'neutral', size = 'md', dot = false, className = '', children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${tones[tone]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === 'neutral'
              ? 'bg-muted'
              : tone === 'success'
                ? 'bg-primary'
                : tone === 'warning'
                  ? 'bg-warning'
                  : tone === 'danger'
                    ? 'bg-danger'
                    : 'bg-info'
          }`}
        />
      )}
      {children}
    </span>
  )
})

export function BadgeGroup({ children, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}