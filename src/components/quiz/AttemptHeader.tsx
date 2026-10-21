import { Link } from 'react-router'
import { XIcon } from 'lucide-react'
import { ProgressBar } from '../ui/ProgressBar'
import { CountdownDisplay } from './CountdownDisplay'
import { QuizTile } from './QuizTile'

export interface AttemptTimer {
  label: string
  secondsLeft: number
  totalSeconds: number
}

interface AttemptHeaderProps {
  quizId: string
  quizTitle: string
  /** One-based. */
  questionNumber: number
  total: number
  timers: AttemptTimer[]
}

export function AttemptHeader({
  quizId,
  quizTitle,
  questionNumber,
  total,
  timers,
}: AttemptHeaderProps) {
  return (
    <header className="border-b-2 border-edge bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <Link
          to={`/quiz/${quizId}`}
          aria-label="Save and exit. Your progress is kept."
          className="inline-flex size-11 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-edge font-bold no-underline hover:bg-bg sm:w-auto sm:pr-4 sm:pl-3"
        >
          <XIcon size={18} />
          <span className="hidden text-sm sm:inline" aria-hidden="true">
            Save and exit
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden sm:block">
            <QuizTile quizId={quizId} title={quizTitle} className="size-10 rounded-xl text-base" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-muted sm:text-base sm:text-fg">
              {quizTitle}
            </h1>
            <p
              className="font-display text-lg font-extrabold sm:font-sans sm:text-sm sm:font-medium sm:text-muted"
              aria-live="polite"
            >
              Question {questionNumber} of {total}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {timers.map((timer) => (
            <CountdownDisplay key={timer.label} {...timer} />
          ))}
        </div>
        <div className="w-full lg:order-none lg:w-64 lg:flex-none xl:w-80">
          <ProgressBar value={questionNumber} max={total} label="Quiz progress" />
        </div>
      </div>
    </header>
  )
}
