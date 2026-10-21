import { Link } from 'react-router'
import { useState } from 'react'
import { AdminQuizFilters } from '../components/admin/AdminQuizFilters'
import { AdminQuizRow } from '../components/admin/AdminQuizRow'
import { ImportOutcomeNotice } from '../components/admin/ImportOutcomeNotice'
import { QuizTransferButtons } from '../components/admin/QuizTransferButtons'
import { getExportFilename, serializeQuizzes } from '../components/admin/quizTransfer'
import { searchAndSortQuizzes, type QuizSortKey } from '../components/admin/quizSort'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { useQuizImport } from '../hooks/useQuizImport'
import { useQuizData, useQuizStore } from '../store/quizStore'
import type { Quiz } from '../types/models'
import { downloadTextFile } from '../utils/downloadFile'
import { paginate } from '../utils/paginate'

const PAGE_SIZE = 4

export function AdminQuizListPage() {
  const { quizzes } = useQuizData()
  const deleteQuiz = useQuizStore((state) => state.deleteQuiz)
  const resetData = useQuizStore((state) => state.resetData)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<QuizSortKey>('title-asc')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Quiz | null>(null)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const { outcome, importFile, dismissOutcome } = useQuizImport()

  const pagination = paginate(searchAndSortQuizzes(quizzes, search, sort), page, PAGE_SIZE)
  const visible = pagination.items

  function confirmDelete() {
    if (!pendingDelete) return
    deleteQuiz(pendingDelete.id)
    setPendingDelete(null)
  }

  function handleExport() {
    const exportedAt = new Date()
    downloadTextFile(
      getExportFilename(exportedAt),
      serializeQuizzes(quizzes, exportedAt),
      'application/json',
    )
  }

  async function handleImportFile(file: File) {
    const result = await importFile(file)
    // New quizzes are mixed into the sorted list, so go back to the start to find them.
    if (result.status === 'imported') setPage(1)
  }

  function confirmReset() {
    resetData()
    setPage(1)
    setIsResetOpen(false)
  }

  return (
    <section aria-labelledby="admin-heading" className="flex flex-col gap-6">
      <PageHeader
        headingId="admin-heading"
        size="md"
        title="Manage quizzes"
        actions={
          <div className="flex flex-wrap gap-2 self-start lg:self-auto">
            <QuizTransferButtons
              canExport={quizzes.length > 0}
              onExport={handleExport}
              onImportFile={handleImportFile}
            />
            <Button variant="secondary" onClick={() => setIsResetOpen(true)}>
              Reset data
            </Button>
            <Button asChild>
              <Link to="/admin/new">+ New quiz</Link>
            </Button>
          </div>
        }
      />

      <ImportOutcomeNotice outcome={outcome} onDismiss={dismissOutcome} />

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

      <ConfirmDialog
        open={isResetOpen}
        title="Reset all data?"
        message="Quizzes, attempts and the leaderboard go back to the original seed data. Your changes will be lost."
        confirmLabel="Reset data"
        onConfirm={confirmReset}
        onCancel={() => setIsResetOpen(false)}
      />
    </section>
  )
}
