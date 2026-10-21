import { Link, useNavigate, useParams } from 'react-router'
import { createEmptyDraft, toDraft } from '../components/admin/quizDraft'
import { QuizForm } from '../components/admin/QuizForm'
import { BackLink } from '../components/ui/BackLink'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { quizService } from '../services/quizService'

/** Handles both /admin/new and /admin/:quizId/edit. */
export function QuizEditorPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const quiz = quizId ? quizService.getQuiz(quizId) : undefined
  const isEdit = quizId !== undefined

  if (isEdit && !quiz) {
    return (
      <EmptyState
        title="Quiz not found"
        description="It may have been deleted."
        action={
          <Button asChild>
            <Link to="/admin">Back to admin</Link>
          </Button>
        }
      />
    )
  }

  return (
    <section aria-labelledby="editor-heading" className="mx-auto flex max-w-3xl flex-col gap-6">
      <BackLink to="/admin" />
      <PageHeader
        headingId="editor-heading"
        size="md"
        title={quiz ? `Edit “${quiz.title}”` : 'New quiz'}
      />
      <QuizForm
        key={quizId ?? 'new'}
        initial={quiz ? toDraft(quiz) : createEmptyDraft()}
        countries={quizService.getCountries()}
        submitLabel={quiz ? 'Save changes' : 'Create quiz'}
        // TODO: call createQuiz / updateQuiz once the data service exists.
        onSubmit={() => navigate('/admin')}
      />
    </section>
  )
}
