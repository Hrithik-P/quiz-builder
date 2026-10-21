import { displayClass } from '../../styles/styles'
import type { AttemptResult } from '../../types/views'
import { formatPercentage } from '../../utils/format'
import { BackLink } from '../ui/BackLink'
import { Ring } from '../ui/Ring'

function headline(percentage: number): string {
  if (percentage === 100) return 'Perfect score!'
  if (percentage >= 75) return 'Nicely done!'
  if (percentage >= 50) return 'Good effort!'
  return 'Quiz complete'
}

interface ScorePanelProps {
  headingId: string
  quizTitle: string
  result: AttemptResult
}

export function ScorePanel({ headingId, quizTitle, result }: ScorePanelProps) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-[2rem] bg-panel px-5 pt-5 pb-10 text-panel-fg sm:px-10 lg:pt-8">
      <BackLink surface="panel" />
      <div className="flex-1" />
      <div className="relative mt-6 flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-bold tracking-[0.08em] text-panel-muted uppercase">
          {quizTitle} · Results
        </p>
        <h1 id={headingId} className={`${displayClass} text-4xl sm:text-5xl lg:text-6xl`}>
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
  )
}
