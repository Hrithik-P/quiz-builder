import { GripVerticalIcon } from 'lucide-react'
import { cardClass } from '../../styles/styles'
import type { Question } from '../../types/models'
import { describeQuestion } from './quizDraft'

interface QuestionDragPreviewProps {
  question: Question
  number: number
}

export function QuestionDragPreview({ question, number }: QuestionDragPreviewProps) {
  return (
    <div
      className={`${cardClass} flex cursor-grabbing items-center gap-3 shadow-pop-lg`}
      aria-hidden="true"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-lg font-extrabold">Question {number}</span>
        <span className="truncate text-sm text-muted">{describeQuestion(question)}</span>
      </span>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-edge">
        <GripVerticalIcon size={20} />
      </span>
    </div>
  )
}
