import type { ComponentType, ReactNode } from 'react'
import { ClockIcon, KeyboardIcon, TrophyIcon } from 'lucide-react'
import { eyebrowClass } from '../../styles/styles'
import { formatSeconds } from '../../utils/format'

interface QuizRulesProps {
  timeLimitSeconds: number | null
  perQuestionSeconds: number | null
}

function Rule({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 shrink-0 text-accent" />
      {children}
    </li>
  )
}

export function QuizRules({ timeLimitSeconds, perQuestionSeconds }: QuizRulesProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className={eyebrowClass}>Before you start</h2>
      <ul className="flex flex-col gap-3 text-[0.95rem]">
        {timeLimitSeconds !== null && perQuestionSeconds !== null ? (
          <Rule icon={ClockIcon}>
            {formatSeconds(timeLimitSeconds)} overall, and {formatSeconds(perQuestionSeconds)} for
            each question.
          </Rule>
        ) : null}
        <Rule icon={ClockIcon}>
          The clock keeps running if you leave. Come back any time to resume.
        </Rule>
        <Rule icon={KeyboardIcon}>Pick answers with the keyboard and press Enter to submit.</Rule>
        <Rule icon={TrophyIcon}>
          Your best score goes on the leaderboard. Ties go to the faster time.
        </Rule>
      </ul>
    </div>
  )
}
