import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { cardClass, inputClass, labelClass } from '../components/ui/styles'
import { quizService } from '../services/quizService'
import type { Quiz } from '../types/models'
import { formatTimeLimit } from '../utils/format'

const PAGE_SIZE = 4

type SortKey = 'title-asc' | 'title-desc' | 'questions-desc' | 'questions-asc'

const sorters: Record<SortKey, (a: Quiz, b: Quiz) => number> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'questions-desc': (a, b) => b.questions.length - a.questions.length,
  'questions-asc': (a, b) => a.questions.length - b.questions.length,
}

export function AdminQuizListPage() {
  // UI only: deletes are kept in local state until the data service exists.
  const [quizzes, setQuizzes] = useState(() => quizService.getAllQuizzes())
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('title-asc')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Quiz | null>(null)

  const term = search.trim().toLowerCase()
  const filtered = quizzes
    .filter(
      (q) => q.title.toLowerCase().includes(term) || q.description.toLowerCase().includes(term),
    )
    .sort(sorters[sort])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function confirmDelete() {
    if (!pendingDelete) return
    setQuizzes((qs) => qs.filter((q) => q.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  return (
    <section aria-labelledby="admin-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          id="admin-heading"
          className="font-display text-4xl leading-none font-extrabold tracking-tight sm:text-5xl"
        >
          Manage quizzes
        </h1>
        <ButtonLink to="/admin/new">+ New quiz</ButtonLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
        <div>
          <label htmlFor="admin-search" className={labelClass}>
            Search
          </label>
          <input
            id="admin-search"
            type="search"
            className={inputClass}
            placeholder="Search by title or description"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </div>
        <div>
          <label htmlFor="admin-sort" className={labelClass}>
            Sort by
          </label>
          <select
            id="admin-sort"
            className={inputClass}
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
          >
            <option value="title-asc">Title (A–Z)</option>
            <option value="title-desc">Title (Z–A)</option>
            <option value="questions-desc">Most questions</option>
            <option value="questions-asc">Fewest questions</option>
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          description={term ? 'Try a different search.' : 'Create your first quiz to get started.'}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((quiz) => (
            <li
              key={quiz.id}
              className={`${cardClass} flex flex-col gap-3 md:flex-row md:items-center`}
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold">{quiz.title}</h2>
                <p className="truncate text-sm text-muted">{quiz.description}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Quiz details">
                  <li>
                    <Badge>{quiz.questions.length} questions</Badge>
                  </li>
                  <li>
                    <Badge>{formatTimeLimit(quiz)}</Badge>
                  </li>
                  <li>
                    <Badge tone={quiz.retakesAllowed ? 'success' : 'accent'}>
                      {quiz.retakesAllowed ? 'Retakes allowed' : 'No retakes'}
                    </Badge>
                  </li>
                  {quiz.countries.map((code) => (
                    <li key={code}>
                      <Badge>{code}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <ButtonLink
                  to={`/admin/${quiz.id}/edit`}
                  variant="secondary"
                  className="flex-1 md:flex-none"
                  aria-label={`Edit ${quiz.title}`}
                >
                  Edit
                </ButtonLink>
                <Button
                  variant="ghost"
                  className="flex-1 text-danger md:flex-none"
                  onClick={() => setPendingDelete(quiz)}
                  aria-label={`Delete ${quiz.title}`}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted" aria-live="polite">
            Page {currentPage} of {pageCount}
          </span>
          <Button
            variant="secondary"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete quiz?"
        message={`“${pendingDelete?.title ?? ''}” and its questions will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
