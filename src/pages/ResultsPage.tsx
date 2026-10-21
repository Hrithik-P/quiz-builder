import { Link, useParams } from 'react-router'
import { LockIcon, RotateCcwIcon } from 'lucide-react'
import { LeaderboardPreview } from '../components/leaderboard/LeaderboardPreview'
import { ScorePanel } from '../components/results/ScorePanel'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Notice } from '../components/ui/Notice'
import { StatGrid } from '../components/ui/StatGrid'
import { getLeaderboard, getQuizInfo, getResult } from '../services/quizQueries'
import { useQuizData } from '../store/quizStore'
import { useSessionStore } from '../store/sessionStore'
import { formatClock } from '../utils/format'

export function ResultsPage() {
  const { attemptId = '' } = useParams()
  const userId = useSessionStore((state) => state.userId)
  const quizData = useQuizData()
  const result = getResult(quizData, attemptId)
  const quiz = result && getQuizInfo(quizData, result.quizId)

  if (!result) {
    return (
      <EmptyState
        title="Result not found"
        description="This attempt does not exist or has not been completed yet."
        action={
          <Button asChild>
            <Link to="/">Back to quizzes</Link>
          </Button>
        }
      />
    )
  }

  const leaderboard = getLeaderboard(quizData, result.quizId)
  const quizTitle = quiz?.title ?? 'Quiz'

  return (
    <section
      aria-labelledby="results-heading"
      className="grid gap-5 lg:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8"
    >
      <ScorePanel headingId="results-heading" quizTitle={quizTitle} result={result} />

      <div className="flex flex-col justify-center gap-5 lg:px-2">
        <StatGrid
          stats={[
            { label: 'Correct', value: String(result.correctCount), tone: 'success' },
            { label: 'Incorrect', value: String(result.incorrectCount), tone: 'danger' },
            { label: 'Time', value: formatClock(result.timeTakenSeconds) },
          ]}
        />

        {quiz && !quiz.retakesAllowed ? (
          <Notice icon={LockIcon}>
            You have completed this quiz. Retakes are not allowed, so this is your final result.
          </Notice>
        ) : null}

        {leaderboard.length > 0 ? (
          <LeaderboardPreview
            quizId={result.quizId}
            quizTitle={quizTitle}
            ranked={leaderboard}
            currentUserId={userId}
          />
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="secondary" size="lg">
            <Link to="/">All quizzes</Link>
          </Button>
          {quiz?.retakesAllowed ? (
            <Button asChild size="lg" className="order-first sm:order-none">
              <Link to={`/quiz/${quiz.id}`}>
                <RotateCcwIcon size={18} />
                Try again
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="order-first sm:order-none">
              <Link to={`/leaderboard/${result.quizId}`}>View leaderboard</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
