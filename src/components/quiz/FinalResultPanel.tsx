import { Link } from 'react-router'
import { LockIcon } from 'lucide-react'
import { displayClass, eyebrowClass } from '../../styles/styles'
import type { AttemptResult } from '../../types/views'
import { formatClock, formatPercentage } from '../../utils/format'
import { Button } from '../ui/Button'
import { StatGrid } from '../ui/StatGrid'

interface FinalResultPanelProps {
  result: AttemptResult
}

/** Replaces the Start button when retakes are off. */
export function FinalResultPanel({ result }: FinalResultPanelProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <p className={`${eyebrowClass} flex items-center gap-1.5`}>
          <LockIcon size={14} />
          Retakes are off
        </p>
        <h2 className={`${displayClass} text-3xl`}>You have already completed this quiz</h2>
        <p className="text-muted">This is your final result.</p>
      </div>
      <StatGrid
        stats={[
          { label: 'Score', value: `${result.score}/${result.totalQuestions}` },
          { label: 'Percentage', value: formatPercentage(result.percentage), tone: 'success' },
          { label: 'Time', value: formatClock(result.timeTakenSeconds) },
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg">
          <Link to={`/results/${result.attemptId}`}>View result</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link to={`/leaderboard/${result.quizId}`}>Leaderboard</Link>
        </Button>
      </div>
    </>
  )
}
