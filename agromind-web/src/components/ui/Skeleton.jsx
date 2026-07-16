export function Skeleton({ className = '', variant = 'default' }) {
  const variants = {
    default: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
    title: 'rounded h-6 w-2/3',
    avatar: 'rounded-full h-10 w-10',
    card: 'rounded-xl h-44',
    chart: 'rounded-xl h-64',
  }

  return (
    <div
      className={`skeleton ${variants[variant]} ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonGroup({ count = 3, className = 'h-40', variant = 'card' }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant={variant} className={className} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} className="h-3 flex-1 opacity-60" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-5">
      {/* Hero skeleton */}
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Skeleton className="h-[420px] rounded-xl" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
      {/* Bottom skeleton */}
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}