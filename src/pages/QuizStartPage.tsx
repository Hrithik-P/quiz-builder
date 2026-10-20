import { Link, useParams } from 'react-router'
import { QuizUnavailable } from '../components/quiz/QuizUnavailable'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  KeyboardIcon,
  LockIcon,
  PodiumIcon,
} from '../components/ui/icons'
import { StatCard } from '../components/ui/StatCard'
import { buttonClass, displayClass, eyebrowClass } from '../components/ui/styles'
import { quizService } from '../services/quizService'
import { useSessionStore } from '../store/sessionStore'
import { formatClock, formatPercentage, formatSeconds } from '../utils/format'
import { quizTileClass } from '../utils/quizTheme'

export function QuizStartPage() {
  const { quizId = '' } = useParams()
  const userId = useSessionStore((s) => s.userId)
  const quiz = quizService.getQuizSummary(quizId, userId)

  if (!quiz) return <QuizUnavailable reason="not-found" />

  const inProgress = quizService.getInProgressAttempt(quiz.id, userId)
  const priorResult = quizService.getBestResult(quiz.id, userId)
  const locked = quiz.completed && !quiz.retakesAllowed

  return (
    <section
      aria-labelledby="quiz-title"
      className="grid gap-5 lg:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8"
    >
      <header
        className={`relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-edge p-5 text-tile-fg sm:min-h-80 sm:p-8 lg:p-10 ${quizTileClass(quiz.id)}`}
      >
        <Link
          to="/"
          className="relative inline-flex min-h-11 items-center gap-2 self-start rounded-full border-2 border-edge bg-white pr-4 pl-3 text-sm font-bold text-tile-fg no-underline shadow-pop-sm"
        >
          <ArrowLeftIcon size={18} />
          All quizzes
        </Link>
        <div className="flex-1" />
        <div className="relative flex max-w-xl flex-col gap-3 pt-10 sm:pt-16 lg:gap-4">
          {priorResult && (
            <span className="self-start rounded-full bg-tile-fg px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-white uppercase">
              Your best · {formatPercentage(priorResult.percentage)}
            </span>
          )}
          <h1
            id="quiz-title"
            className={`${displayClass} text-4xl leading-none sm:text-5xl lg:text-6xl`}
          >
            {quiz.title}
          </h1>
          <p className="text-lg font-medium lg:text-xl">{quiz.description}</p>
        </div>
      </header>

      <div className="flex flex-col justify-center gap-6 lg:px-4">
        {locked && priorResult ? (
          <>
            <div className="flex flex-col gap-2">
              <p className={`${eyebrowClass} flex items-center gap-1.5`}>
                <LockIcon size={14} />
                Retakes are off
              </p>
              <h2 className={`${displayClass} text-3xl`}>You have already completed this quiz</h2>
              <p className="text-muted">This is your final result.</p>
            </div>
            <dl className="grid grid-cols-3 gap-3">
              <StatCard
                label="Score"
                value={`${priorResult.score}/${priorResult.totalQuestions}`}
              />
              <StatCard
                label="Percentage"
                value={formatPercentage(priorResult.percentage)}
                tone="success"
              />
              <StatCard label="Time" value={formatClock(priorResult.timeTakenSeconds)} />
            </dl>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to={`/results/${priorResult.attemptId}`}
                className={buttonClass('primary', '', 'lg')}
              >
                View result
              </Link>
              <Link to={`/leaderboard/${quiz.id}`} className={buttonClass('secondary', '', 'lg')}>
                Leaderboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <dl className="grid grid-cols-3 gap-3">
              <StatCard label="Questions" value={String(quiz.questionCount)} />
              <StatCard
                label={quiz.timeLimitSeconds !== null ? 'Time limit' : 'Per question'}
                value={
                  quiz.timeLimitSeconds !== null
                    ? formatClock(quiz.timeLimitSeconds)
                    : quiz.perQuestionSeconds !== null
                      ? formatSeconds(quiz.perQuestionSeconds)
                      : 'None'
                }
              />
              <StatCard label="Retakes" value={quiz.retakesAllowed ? 'Yes' : 'No'} />
            </dl>

            {inProgress && (
              <p
                role="status"
                className="rounded-2xl border-2 border-accent bg-accent/10 p-4 text-sm font-medium"
              >
                You have an unfinished attempt (question {inProgress.currentQuestionIndex + 1} of{' '}
                {inProgress.totalQuestions}). Time kept running while you were away.
              </p>
            )}

            <div className="flex flex-col gap-3">
              <h2 className={eyebrowClass}>Before you start</h2>
              <ul className="flex flex-col gap-3 text-[0.95rem]">
                {quiz.timeLimitSeconds !== null && quiz.perQuestionSeconds !== null && (
                  <li className="flex gap-3">
                    <ClockIcon className="mt-0.5 shrink-0 text-accent" />
                    {formatSeconds(quiz.timeLimitSeconds)} overall, and{' '}
                    {formatSeconds(quiz.perQuestionSeconds)} for each question.
                  </li>
                )}
                <li className="flex gap-3">
                  <ClockIcon className="mt-0.5 shrink-0 text-accent" />
                  The clock keeps running if you leave. Come back any time to resume.
                </li>
                <li className="flex gap-3">
                  <KeyboardIcon className="mt-0.5 shrink-0 text-accent" />
                  Pick answers with the keyboard and press Enter to submit.
                </li>
                <li className="flex gap-3">
                  <PodiumIcon className="mt-0.5 shrink-0 text-accent" />
                  Your best score goes on the leaderboard. Ties go to the faster time.
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-stretch gap-2">
              <Link
                to={`/quiz/${quiz.id}/attempt/${inProgress?.id ?? 'new'}`}
                className={buttonClass('primary', '', 'xl')}
              >
                {inProgress ? 'Resume quiz' : 'Start quiz'}
                <ArrowRightIcon size={22} />
              </Link>
              <Link
                to={`/leaderboard/${quiz.id}`}
                className="inline-flex min-h-11 items-center justify-center font-bold"
              >
                See the leaderboard
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
