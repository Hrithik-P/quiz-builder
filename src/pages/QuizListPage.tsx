import { useEffect, useState } from 'react'
import { QuizGrid, QuizGridSkeleton } from '../components/quiz/QuizGrid'
import { ResumeBanner } from '../components/quiz/ResumeBanner'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { ToggleGroup, ToggleGroupItem } from '../components/ui/ToggleGroup'
import { useServiceData } from '../hooks/useServiceData'
import { getInProgressAttempt, getQuizzes } from '../services/quizQueries'
import { useQuizData } from '../store/quizStore'
import { useSessionStore } from '../store/sessionStore'
import type { QuizSummary } from '../types/views'
import { formatPercentage } from '../utils/format'

const ALL = 'all'

function progressLine(quizzes: QuizSummary[]): string {
  const done = quizzes.filter((quiz) => quiz.completed)
  const best = Math.max(...done.map((quiz) => quiz.bestPercentage ?? 0))
  const parts = [`${done.length} of ${quizzes.length} quizzes done`]
  if (done.length > 0) parts.push(`best score ${formatPercentage(best)}`)
  return parts.join(' · ')
}

export function QuizListPage() {
  const userId = useSessionStore((state) => state.userId)
  const quizData = useQuizData()
  const user = quizData.users.find((user) => user.id === userId)

  const [country, setCountry] = useState(() => user?.country ?? "")
  const countryOptions = [
    { value: ALL, label: 'All' },
    ...quizData.countries.map((countryOption) => ({
      value: countryOption.code,
      label: countryOption.name,
    })),
  ]
  const firstName = quizData.users.find((user) => user.id === userId)?.name.split(' ')[0] ?? 'there'
  const { data: quizzes, loading } = useServiceData(`${userId}:${country}`, (data) =>
    getQuizzes(data, userId, country || undefined),
  )

  const resumable = quizzes
    ?.map((quiz) => ({ quiz, attempt: getInProgressAttempt(quizData, quiz.id, userId) }))
    .find((entry) => entry.attempt !== undefined)
  const rest = quizzes?.filter((quiz) => quiz.id !== resumable?.quiz.id) ?? []


  
  useEffect(() => {

    if (userId && user?.country) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCountry(user.country)
    }
  }, [user?.country, userId])


  return (
    <section aria-labelledby="quiz-list-heading" className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        headingId="quiz-list-heading"
        eyebrow={`Hi, ${firstName}`}
        title="Pick your next quiz"
        description={
          loading ? (
            <Skeleton className="h-5 w-56" />
          ) : quizzes && quizzes.length > 0 ? (
            <p className="text-muted">{progressLine(quizzes)}</p>
          ) : null
        }
        actions={
          <ToggleGroup
            type="single"
            aria-label="Filter by country"
            value={country || ALL}
            // Ignore deselecting the active chip: one filter is always on.
            onValueChange={(value) => value && setCountry(value === ALL ? '' : value)}
            className="-mx-4 [scrollbar-width:none] flex-nowrap overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
          >
            {countryOptions.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />

      {loading ? (
        <QuizGridSkeleton />
      ) : quizzes && quizzes.length > 0 ? (
        <>
          {resumable?.attempt ? (
            <ResumeBanner quiz={resumable.quiz} attempt={resumable.attempt} />
          ) : null}
          {rest.length > 0 ? (
            <QuizGrid title={resumable ? 'More quizzes' : 'All quizzes'} quizzes={rest} />
          ) : null}
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
