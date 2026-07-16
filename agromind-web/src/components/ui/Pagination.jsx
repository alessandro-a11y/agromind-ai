import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

function getPageList(current, total) {
  const pages = new Set([1, total])
  for (let p = current - 1; p <= current + 1; p++) {
    if (p > 1 && p < total) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const withGaps = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push('gap')
    withGaps.push(p)
  })
  return withGaps
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const items = getPageList(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Paginação">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        aria-label="Página anterior"
      >
        <ChevronLeft size={15} />
      </button>

      {items.map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="flex h-8 w-8 items-center justify-center text-muted/50">
            <MoreHorizontal size={14} />
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`h-8 min-w-8 rounded-lg px-2 text-[13px] font-semibold transition ${
              item === page
                ? 'bg-primary text-slate-950 shadow-md shadow-primary/20'
                : 'text-muted hover:bg-surface-muted hover:text-ink'
            }`}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        aria-label="Próxima página"
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  )
}