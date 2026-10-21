import { Link } from 'react-router'
import { LockIcon } from 'lucide-react'
import type { QuizSummary } from '../../types/views'
import { formatPercentage, formatTimeLimit } from '../../utils/format'
import { Skeleton } from '../ui/Skeleton'
import { QuizTile } from './QuizTile'

interface QuizCardProps {
  quiz: QuizSummary
}

function QuizStatus({ quiz }: QuizCardProps) {
  if (quiz.completed && quiz.bestPercentage !== null) {
    return (
      <span className="flex flex-col items-end">
        <span className="font-display text-2xl leading-none font-extrabold text-success tabular-nums">
          {formatPercentage(quiz.bestPercentage)}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted">
          {quiz.retakesAllowed ? (
            'Best score'
          ) : (
            <>
              <LockIcon size={12} />
              Final
            </>
          )}
        </span>
      </span>
    )
  }
  return (
    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-fg">New</span>
  )
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-edge bg-surface shadow-pop-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-pop has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <QuizTile quizId={quiz.id} title={quiz.title} />
          <h2 className="flex-1 self-center text-lg leading-tight font-bold">
            {/* The ::after overlay makes the whole card clickable. */}
            <Link
              to={`/quiz/${quiz.id}`}
              className="no-underline after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none"
            >
              {quiz.title}
            </Link>
          </h2>
          <QuizStatus quiz={quiz} />
        </div>
        <p className="text-sm text-muted">{quiz.description}</p>
        <p className="mt-auto pt-3 text-xs font-semibold text-muted">
          {quiz.questionCount} questions · {formatTimeLimit(quiz)}
          {!quiz.retakesAllowed && ' · one try'}
        </p>
      </div>
    </article>
  )
}

export function QuizCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border-2 border-line bg-surface">
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
