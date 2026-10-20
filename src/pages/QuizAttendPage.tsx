import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CountdownDisplay } from '../components/quiz/CountdownDisplay'
import { QuestionView } from '../components/quiz/QuestionView'
import { QuizTile } from '../components/quiz/QuizTile'
import { QuizUnavailable } from '../components/quiz/QuizUnavailable'
import { ArrowRightIcon, CloseIcon } from '../components/ui/icons'
import { ProgressBar } from '../components/ui/ProgressBar'
import { buttonClass } from '../components/ui/styles'
import { quizService } from '../services/quizService'

/**
 * UI only: question navigation is local state and the timers are static.
 * TODO: replace with useQuizAttempt / useCountdown backed by the data service.
 */
export function QuizAttendPage() {
  const { quizId = '', attemptId = '' } = useParams()
  const navigate = useNavigate()
  const quiz = quizService.getQuiz(quizId)
  const resumed = quizService.getAttempt(attemptId)

  const [index, setIndex] = useState(resumed?.currentQuestionIndex ?? 0)
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to each new question so keyboard and screen-reader users land on it.
  useEffect(() => {
    headingRef.current?.focus()
  }, [index])

  const question = quiz?.questions[index]
  if (!quiz || !question) {
    return (
      <div className="mx-auto max-w-2xl p-4 pt-10">
        <QuizUnavailable reason={quiz ? 'edited' : 'deleted'} />
      </div>
    )
  }

  const total = quiz.questions.length
  const isLast = index === total - 1

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || selected.length === 0) return
    setSubmitting(true)
    if (isLast) {
      // TODO: completeAttempt(attemptId) first, so the results page has a result to show.
      navigate(`/results/${attemptId}`, { replace: true })
      return
    }
    setIndex(index + 1)
    setSelected([])
    setSubmitting(false)
  }

  // Enter on a radio/checkbox does not submit a form natively, so do it here.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    }
  }

  return (
    <section aria-label={`${quiz.title} quiz`} className="flex min-h-dvh flex-col">
      <header className="border-b-2 border-edge bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
          <Link
            to={`/quiz/${quiz.id}`}
            aria-label="Save and exit. Your progress is kept."
            className="inline-flex size-11 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-edge font-bold no-underline hover:bg-bg sm:w-auto sm:pr-4 sm:pl-3"
          >
            <CloseIcon size={18} />
            <span className="hidden text-sm sm:inline" aria-hidden="true">
              Save and exit
            </span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="hidden sm:block">
              <QuizTile
                quizId={quiz.id}
                title={quiz.title}
                className="size-10 rounded-xl text-base"
              />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-muted sm:text-base sm:text-fg">
                {quiz.title}
              </h1>
              <p
                className="font-display text-lg font-extrabold sm:font-sans sm:text-sm sm:font-medium sm:text-muted"
                aria-live="polite"
              >
                Question {index + 1} of {total}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {quiz.timeLimitSeconds !== null && (
              <CountdownDisplay
                label="Quiz"
                secondsLeft={quiz.timeLimitSeconds}
                totalSeconds={quiz.timeLimitSeconds}
              />
            )}
            {quiz.perQuestionSeconds !== null && (
              <CountdownDisplay
                label="Question"
                secondsLeft={quiz.perQuestionSeconds}
                totalSeconds={quiz.perQuestionSeconds}
              />
            )}
          </div>
          <div className="w-full lg:order-none lg:w-64 lg:flex-none xl:w-80">
            <ProgressBar value={index + 1} max={total} label="Quiz progress" />
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pt-8 pb-6 sm:px-6 lg:pt-14"
      >
        {/* Keyed so each question re-mounts and plays the enter animation. */}
        <div key={question.id} className="animate-question-in">
          <QuestionView
            question={quizService.toPublicQuestion(question)}
            selectedOptionIds={selected}
            onChange={setSelected}
            disabled={submitting}
            headingRef={headingRef}
          />
        </div>
        <div className="sticky bottom-0 -mx-4 mt-auto flex items-center justify-end gap-4 bg-bg/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <p className="hidden text-sm text-muted sm:block">
            Press{' '}
            <kbd className="rounded-md border-2 border-line bg-surface px-1.5 font-sans text-xs font-bold text-fg">
              Enter
            </kbd>{' '}
            to submit
          </p>
          <button
            type="submit"
            className={buttonClass('primary', 'w-full sm:w-auto', 'xl')}
            disabled={submitting || selected.length === 0}
          >
            {isLast ? 'Finish quiz' : 'Lock it in'}
            <ArrowRightIcon size={22} />
          </button>
        </div>
      </form>
    </section>
  )
}
