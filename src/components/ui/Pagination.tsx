import { Button } from './Button'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

/** Renders nothing for a single page. */
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-muted" aria-live="polite">
        Page {page} of {pageCount}
      </span>
      <Button
        variant="secondary"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}
