import { Link, useNavigate, useParams } from 'react-router'
import { LeaderboardCard } from '../components/leaderboard/LeaderboardCard'
import { LeaderboardSkeleton } from '../components/leaderboard/LeaderboardSkeleton'
import { QuizPicker } from '../components/leaderboard/QuizPicker'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { useServiceData } from '../hooks/useServiceData'
import { quizService } from '../services/quizService'
import { useSessionStore } from '../store/sessionStore'

const TOP_LIMIT = 10

export function LeaderboardPage() {
  const params = useParams()
  const navigate = useNavigate()
  const userId = useSessionStore((s) => s.userId)
  const quizzes = quizService.getAllQuizzes()
  const quizId = params.quizId ?? quizzes[0]?.id ?? ''
  const quiz = quizzes.find((q) => q.id === quizId)
  const { data: ranked, loading } = useServiceData(quizId, () => quizService.getLeaderboard(quizId))

  return (
    <section aria-labelledby="leaderboard-heading" className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        headingId="leaderboard-heading"
        title="Leaderboard"
        description="Best attempt per player."
        actions={
          <QuizPicker
            quizzes={quizzes}
            value={quizId}
            onChange={(id) => navigate(`/leaderboard/${id}`)}
          />
        }
      />

      {!quiz ? (
        <EmptyState title="Quiz not found" description="Pick another quiz from the list." />
      ) : loading ? (
        <LeaderboardSkeleton />
      ) : !ranked || ranked.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Nobody has completed this quiz. Be the first!"
          action={
            <Button asChild>
              <Link to={`/quiz/${quiz.id}`}>Take the quiz</Link>
            </Button>
          }
        />
      ) : (
        <LeaderboardCard
          quizId={quiz.id}
          quizTitle={quiz.title}
          ranked={ranked}
          currentUserId={userId}
          limit={TOP_LIMIT}
        />
      )}
    </section>
  )
}
