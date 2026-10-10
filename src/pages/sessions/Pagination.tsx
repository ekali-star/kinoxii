import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons'

function pageItems(current: number, last: number) {
  const pages = new Set([1, last, current - 1, current, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b)
  const items: (number | 'gap')[] = []
  for (const page of sorted) {
    const previous = items.at(-1)
    if (typeof previous === 'number' && page - previous === 2) items.push(page - 1)
    else if (typeof previous === 'number' && page - previous > 2) items.push('gap')
    items.push(page)
  }
  return items
}

interface PaginationProps {
  current: number
  last: number
  onChange: (page: number) => void
}

export function Pagination({ current, last, onChange }: PaginationProps) {
  if (last <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__arrow"
        aria-label="Previous page"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        <ChevronLeftIcon size={18} />
      </button>

      <ol className="pagination__pages">
        {pageItems(current, last).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="pagination__page"
                aria-label={`Page ${item}`}
                aria-current={item === current ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        className="pagination__arrow"
        aria-label="Next page"
        disabled={current >= last}
        onClick={() => onChange(current + 1)}
      >
        <ChevronRightIcon size={18} />
      </button>

      <p className="pagination__status">
        Page {current} of {last}
      </p>
    </nav>
  )
}
