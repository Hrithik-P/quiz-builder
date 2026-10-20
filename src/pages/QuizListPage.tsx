import { useState } from 'react'
import { QuizCard, QuizCardSkeleton } from '../components/quiz/QuizCard'
import { ResumeBanner } from '../components/quiz/ResumeBanner'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { displayClass, eyebrowClass } from '../components/ui/styles'
import { useServiceData } from '../hooks/useServiceData'
import { quizService } from '../services/quizService'
import { useSessionStore } from '../store/sessionStore'
import type { QuizSummary } from '../types/views'
import { formatPercentage } from '../utils/format'

function progressLine(quizzes: QuizSummary[]): string {
  const done = quizzes.filter((q) => q.completed)
  const best = Math.max(...done.map((q) => q.bestPercentage ?? 0))
  const parts = [`${done.length} of ${quizzes.length} quizzes done`]
  if (done.length > 0) parts.push(`best score ${formatPercentage(best)}`)
  return parts.join(' · ')
}

const chipClass =
  'min-h-11 shrink-0 rounded-full border-2 border-edge px-4 text-sm font-semibold whitespace-nowrap transition-colors aria-pressed:bg-fg aria-pressed:text-bg hover:bg-surface aria-pressed:hover:bg-fg'

export function QuizListPage() {
  const userId = useSessionStore((s) => s.userId)
  const [country, setCountry] = useState('')
  const countries = quizService.getCountries()
  const firstName = quizService.getUser(userId)?.name.split(' ')[0] ?? 'there'
  const { data: quizzes, loading } = useServiceData(`${userId}:${country}`, () =>
    quizService.getQuizzes(userId, country || undefined),
  )

  const resumable = quizzes
    ?.map((quiz) => ({ quiz, attempt: quizService.getInProgressAttempt(quiz.id, userId) }))
    .find((entry) => entry.attempt !== undefined)
  const rest = quizzes?.filter((q) => q.id !== resumable?.quiz.id) ?? []

  return (
    <section aria-labelledby="quiz-list-heading" className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className={eyebrowClass}>Hi, {firstName}</p>
          <h1
            id="quiz-list-heading"
            className={`${displayClass} text-4xl leading-[1.02] sm:text-5xl lg:text-6xl`}
          >
            Pick your next quiz
          </h1>
          {loading ? (
            <Skeleton className="h-5 w-56" />
          ) : (
            quizzes && quizzes.length > 0 && <p className="text-muted">{progressLine(quizzes)}</p>
          )}
        </div>

        <div
          role="group"
          aria-label="Filter by country"
          className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
        >
          <button
            type="button"
            aria-pressed={country === ''}
            className={chipClass}
            onClick={() => setCountry('')}
          >
            All
          </button>
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              aria-pressed={country === c.code}
              className={chipClass}
              onClick={() => setCountry(c.code)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div aria-busy="true" aria-label="Loading quizzes" className="flex flex-col gap-6">
          <Skeleton className="h-44 rounded-3xl" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <>
          {resumable?.attempt && <ResumeBanner quiz={resumable.quiz} attempt={resumable.attempt} />}
          {rest.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className={eyebrowClass}>{resumable ? 'More quizzes' : 'All quizzes'}</h2>
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {rest.map((quiz) => (
                  <li key={quiz.id} className="grid">
                    <QuizCard quiz={quiz} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No quizzes here yet"
          description="There are no quizzes assigned to this country."
          action={
            <Button variant="secondary" onClick={() => setCountry('')}>
              Show all countries
            </Button>
          }
        />
      )}
    </section>
  )
}
