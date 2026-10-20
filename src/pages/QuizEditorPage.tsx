import { Link, useNavigate, useParams } from 'react-router'
import { QuizForm } from '../components/admin/QuizForm'
import { createEmptyDraft, toDraft } from '../components/admin/quizDraft'
import { EmptyState } from '../components/ui/EmptyState'
import { buttonClass } from '../components/ui/styles'
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
          <Link to="/admin" className={buttonClass('primary')}>
            Back to admin
          </Link>
        }
      />
    )
  }

  return (
    <section aria-labelledby="editor-heading" className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link to="/admin" className="text-sm text-muted hover:text-fg">
        ← All quizzes
      </Link>
      <h1
        id="editor-heading"
        className="font-display text-4xl leading-none font-extrabold tracking-tight sm:text-5xl"
      >
        {quiz ? `Edit “${quiz.title}”` : 'New quiz'}
      </h1>
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
