import { Link, useParams } from 'react-router'
import { QuizTile } from '../components/quiz/QuizTile'
import { EmptyState } from '../components/ui/EmptyState'
import { ArrowLeftIcon, ArrowRightIcon, LockIcon, RetryIcon } from '../components/ui/icons'
import { Ring } from '../components/ui/Ring'
import { StatCard } from '../components/ui/StatCard'
import { buttonClass, displayClass } from '../components/ui/styles'
import { quizService } from '../services/quizService'
import { formatClock, formatPercentage } from '../utils/format'

const PREVIEW_ROWS = 4

function headline(percentage: number): string {
  if (percentage === 100) return 'Perfect score!'
  if (percentage >= 75) return 'Nicely done!'
  if (percentage >= 50) return 'Good effort!'
  return 'Quiz complete'
}

export function ResultsPage() {
  const { attemptId = '' } = useParams()
  const result = quizService.getResult(attemptId)
  const quiz = result && quizService.getQuiz(result.quizId)

  if (!result) {
    return (
      <EmptyState
        title="Result not found"
        description="This attempt does not exist or has not been completed yet."
        action={
          <Link to="/" className={buttonClass('primary')}>
            Back to quizzes
          </Link>
        }
      />
    )
  }

  const leaderboard = quizService.getLeaderboard(result.quizId)
  const myEntry = leaderboard.find((e) => e.userId === result.userId)
  const preview = leaderboard.slice(0, PREVIEW_ROWS)
  const quizTitle = quiz?.title ?? 'Quiz'

  return (
    <section
      aria-labelledby="results-heading"
      className="grid gap-5 lg:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8"
    >
      <div className="relative flex flex-col items-center overflow-hidden rounded-[2rem] bg-panel px-5 pt-5 pb-10 text-panel-fg sm:px-10 lg:pt-8">
        <Link
          to="/"
          className="relative inline-flex min-h-11 items-center gap-2 self-start rounded-full border-2 border-panel-muted/40 pr-4 pl-3 text-sm font-bold text-panel-fg no-underline hover:bg-white/10"
        >
          <ArrowLeftIcon size={18} />
          All quizzes
        </Link>
        <div className="flex-1" />
        <div className="relative mt-6 flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-bold tracking-[0.08em] text-panel-muted uppercase">
            {quizTitle} · Results
          </p>
          <h1 id="results-heading" className={`${displayClass} text-4xl sm:text-5xl lg:text-6xl`}>
            {headline(result.percentage)}
          </h1>
          <p className="text-panel-muted">
            You scored {result.score} out of {result.totalQuestions}
          </p>
        </div>
        <div className="relative mt-8">
          <Ring
            fraction={result.percentage / 100}
            size={220}
            strokeWidth={20}
            arcClass="stroke-tile-5"
            trackClass="stroke-white/10"
          >
            <span className="flex flex-col items-center">
              <span className="font-display text-6xl leading-none font-extrabold tracking-tighter tabular-nums">
                {formatPercentage(result.percentage)}
              </span>
              <span className="mt-1 text-sm font-semibold text-panel-muted">
                {result.correctCount} of {result.totalQuestions} correct
              </span>
            </span>
          </Ring>
        </div>
        <div className="flex-1" />
      </div>

      <div className="flex flex-col justify-center gap-5 lg:px-2">
        <dl className="grid grid-cols-3 gap-3">
          <StatCard label="Correct" value={String(result.correctCount)} tone="success" />
          <StatCard label="Incorrect" value={String(result.incorrectCount)} tone="danger" />
          <StatCard label="Time" value={formatClock(result.timeTakenSeconds)} />
        </dl>

        {quiz && !quiz.retakesAllowed && (
          <p
            role="status"
            className="flex items-start gap-3 rounded-2xl border-2 border-line bg-surface p-4 text-sm"
          >
            <LockIcon size={18} className="mt-0.5 shrink-0 text-accent" />
            You have completed this quiz. Retakes are not allowed, so this is your final result.
          </p>
        )}

        {preview.length > 0 && (
          <div className="flex flex-col gap-3 rounded-3xl border-2 border-edge bg-surface p-4 shadow-pop sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-3 font-display text-xl font-extrabold">
                {quiz && (
                  <QuizTile
                    quizId={quiz.id}
                    title={quiz.title}
                    className="size-9 rounded-xl text-sm"
                  />
                )}
                {myEntry ? `You're #${myEntry.rank}` : 'Leaderboard'}
              </h2>
              <Link
                to={`/leaderboard/${result.quizId}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold"
              >
                Full leaderboard
                <ArrowRightIcon size={16} />
              </Link>
            </div>
            <ol className="flex flex-col gap-1.5 text-[0.95rem]">
              {preview.map((entry) => {
                const isMe = entry.userId === result.userId
                return (
                  <li
                    key={entry.attemptId}
                    aria-current={isMe ? 'true' : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-xl tabular-nums ${
                      isMe ? 'border-2 border-accent bg-accent/10 px-2.5' : 'px-3'
                    }`}
                  >
                    <span className="w-5 font-extrabold">{entry.rank}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {entry.userName}
                      {isMe && <span className="ml-1 text-xs font-bold text-accent">· you</span>}
                    </span>
                    <span className="font-bold">
                      {entry.score}/{entry.totalQuestions} · {formatClock(entry.timeTakenSeconds)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/" className={buttonClass('secondary', '', 'lg')}>
            All quizzes
          </Link>
          {quiz?.retakesAllowed ? (
            <Link
              to={`/quiz/${quiz.id}`}
              className={buttonClass('primary', 'order-first sm:order-none', 'lg')}
            >
              <RetryIcon size={18} />
              Try again
            </Link>
          ) : (
            <Link
              to={`/leaderboard/${result.quizId}`}
              className={buttonClass('primary', 'order-first sm:order-none', 'lg')}
            >
              View leaderboard
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
