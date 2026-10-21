import { Navigate, useParams } from 'react-router'
import { AttemptQuestionScreen } from '../components/quiz/AttemptQuestionScreen'
import { QuizUnavailable } from '../components/quiz/QuizUnavailable'
import { Skeleton } from '../components/ui/Skeleton'
import { useQuizAttempt } from '../hooks/useQuizAttempt'

export function QuizAttendPage() {
  const { quizId = '', attemptId = '' } = useParams()
  const { view, quizTitle, submitAnswer } = useQuizAttempt(quizId, attemptId)

  switch (view.status) {
    case 'loading':
      return (
        <div role="status" aria-label="Starting your quiz" className="mx-auto max-w-2xl p-4 pt-10">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mt-6 h-40 w-full" />
        </div>
      )
    case 'not_found':
      return (
        <div className="mx-auto max-w-2xl p-4 pt-10">
          <QuizUnavailable reason="attempt-not-found" />
        </div>
      )
    case 'quiz_unavailable':
      return (
        <div className="mx-auto max-w-2xl p-4 pt-10">
          <QuizUnavailable reason={view.reason} />
        </div>
      )
    case 'completed':
      return <Navigate to={`/results/${view.attemptId}`} replace />
    case 'question':
      return (
        <AttemptQuestionScreen
          quizId={quizId}
          quizTitle={quizTitle}
          state={view}
          onSubmit={submitAnswer}
        />
      )
  }
}
