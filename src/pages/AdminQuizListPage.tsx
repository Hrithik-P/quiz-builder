import { Link } from 'react-router'
import { useState } from 'react'
import { AdminQuizFilters } from '../components/admin/AdminQuizFilters'
import { AdminQuizRow } from '../components/admin/AdminQuizRow'
import { searchAndSortQuizzes, type QuizSortKey } from '../components/admin/quizSort'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { quizService } from '../services/quizService'
import type { Quiz } from '../types/models'
import { paginate } from '../utils/paginate'

const PAGE_SIZE = 4

export function AdminQuizListPage() {
  // TODO: delete through the data service.
  const [quizzes, setQuizzes] = useState(() => quizService.getAllQuizzes())
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<QuizSortKey>('title-asc')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Quiz | null>(null)

  const pagination = paginate(searchAndSortQuizzes(quizzes, search, sort), page, PAGE_SIZE)
  const visible = pagination.items

  function confirmDelete() {
    if (!pendingDelete) return
    setQuizzes((currentQuizzes) => currentQuizzes.filter((quiz) => quiz.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  return (
    <section aria-labelledby="admin-heading" className="flex flex-col gap-6">
      <PageHeader
        headingId="admin-heading"
        size="md"
        title="Manage quizzes"
        actions={
          <Button asChild className="self-start lg:self-auto">
            <Link to="/admin/new">+ New quiz</Link>
          </Button>
        }
      />

      <AdminQuizFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        sort={sort}
        onSortChange={setSort}
      />

      {visible.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          description={
            search.trim() ? 'Try a different search.' : 'Create your first quiz to get started.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((quiz) => (
            <AdminQuizRow key={quiz.id} quiz={quiz} onDelete={setPendingDelete} />
          ))}
        </ul>
      )}

      <Pagination page={pagination.page} pageCount={pagination.pageCount} onPageChange={setPage} />

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
