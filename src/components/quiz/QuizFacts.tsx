import type { QuizSummary } from '../../types/views'
import { formatClock, formatSeconds } from '../../utils/format'
import { StatGrid } from '../ui/StatGrid'

type QuizFactsProps = {
  quiz: Pick<
    QuizSummary,
    'questionCount' | 'timeLimitSeconds' | 'perQuestionSeconds' | 'retakesAllowed'
  >
}

export function QuizFacts({ quiz }: QuizFactsProps) {
  const hasOverall = quiz.timeLimitSeconds !== null
  const limit = hasOverall
    ? formatClock(quiz.timeLimitSeconds ?? 0)
    : quiz.perQuestionSeconds !== null
      ? formatSeconds(quiz.perQuestionSeconds)
      : 'None'

  return (
    <StatGrid
      stats={[
        { label: 'Questions', value: String(quiz.questionCount) },
        { label: hasOverall ? 'Time limit' : 'Per question', value: limit },
        { label: 'Retakes', value: quiz.retakesAllowed ? 'Yes' : 'No' },
      ]}
    />
  )
}
