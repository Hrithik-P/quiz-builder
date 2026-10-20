import { Link, useNavigate, useParams } from 'react-router'
import { LeaderboardList } from '../components/leaderboard/LeaderboardList'
import { QuizTile } from '../components/quiz/QuizTile'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ChevronDownIcon, InfoIcon } from '../components/ui/icons'
import { Skeleton } from '../components/ui/Skeleton'
import { displayClass, eyebrowClass } from '../components/ui/styles'
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

  const top = ranked?.slice(0, TOP_LIMIT) ?? []
  const myEntry = ranked?.find((e) => e.userId === userId)
  const myEntryOutsideTop = myEntry && myEntry.rank > TOP_LIMIT ? myEntry : undefined

  return (
    <section aria-labelledby="leaderboard-heading" className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1
            id="leaderboard-heading"
            className={`${displayClass} text-4xl leading-none sm:text-5xl lg:text-6xl`}
          >
            Leaderboard
          </h1>
          <p className="text-muted">Best attempt per player.</p>
        </div>
        <div className="flex w-full flex-col gap-1.5 lg:w-96">
          <label htmlFor="leaderboard-quiz" className={eyebrowClass}>
            Quiz
          </label>
          <div className="relative flex items-center rounded-2xl has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
            {quiz && (
              <QuizTile
                quizId={quiz.id}
                title={quiz.title}
                className="pointer-events-none absolute left-2 size-9 rounded-xl text-sm"
              />
            )}
            <select
              id="leaderboard-quiz"
              className="min-h-13 w-full cursor-pointer appearance-none rounded-2xl border-2 border-edge bg-surface pr-11 pl-14 font-bold text-fg shadow-pop-sm focus-visible:outline-none"
              value={quizId}
              onChange={(event) => navigate(`/leaderboard/${event.target.value}`)}
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={18} className="pointer-events-none absolute right-4" />
          </div>
        </div>
      </div>

      {!quiz ? (
        <EmptyState title="Quiz not found" description="Pick another quiz from the list." />
      ) : loading ? (
        <div
          aria-busy="true"
          aria-label="Loading leaderboard"
          className="flex max-w-4xl flex-col gap-2"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Nobody has completed this quiz. Be the first!"
          action={<ButtonLink to={`/quiz/${quiz.id}`}>Take the quiz</ButtonLink>}
        />
      ) : (
        <div className="flex max-w-4xl flex-col gap-3 rounded-3xl border-2 border-edge bg-surface p-3 sm:p-4">
          <h2 className={`${eyebrowClass} px-1 pt-1`}>
            {quiz.title} · {ranked?.length ?? 0} {ranked?.length === 1 ? 'player' : 'players'}
          </h2>
          <LeaderboardList
            entries={top}
            currentUserId={userId}
            currentUserEntry={myEntryOutsideTop}
          />
          <p className="flex items-center gap-2 px-1 text-sm text-muted">
            <InfoIcon size={16} />
            Ties go to the faster finish.
          </p>
          {!myEntry && (
            <p className="px-1 text-sm">
              You have not completed this quiz yet.{' '}
              <Link to={`/quiz/${quiz.id}`} className="font-bold text-accent underline">
                Take it now
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  )
}
