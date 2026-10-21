import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FocusEvent, KeyboardEvent } from 'react'
import { useFormState, useWatch } from 'react-hook-form'
import { GripVerticalIcon } from 'lucide-react'
import { AccordionContent, AccordionItem, AccordionTrigger } from '../ui/Accordion'
import { Badge } from '../ui/Badge'
import { QuestionFields } from './QuestionFields'
import { describeQuestion, type QuizDraft } from './quizDraft'

interface QuestionEditorProps {
  /** Drag id (react-hook-form's row key). */
  sortableId: string
  /** Accordion item value: the question id. */
  value: string
  /** Position in the form's `questions` array. */
  index: number
  /** One-based position shown on screen. */
  number: number
  expanded: boolean
  onRemove: () => void
  isKeyboardMoving: boolean
  handleRef: (node: HTMLElement | null) => void
  onHandleKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  onHandleBlur: (event: FocusEvent<HTMLButtonElement>) => void
}

export function QuestionEditor({
  sortableId,
  value,
  index,
  number,
  expanded,
  onRemove,
  isKeyboardMoving,
  handleRef,
  onHandleKeyDown,
  onHandleBlur,
}: QuestionEditorProps) {
  const question = useWatch<QuizDraft, `questions.${number}`>({ name: `questions.${index}` })
  const { errors } = useFormState<QuizDraft>({ name: `questions.${index}` })
  const hasErrors = errors.questions?.[index] !== undefined
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId })

  return (
    <AccordionItem value={value} asChild>
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={`relative flex min-w-0 flex-col gap-4 rounded-3xl border-2 bg-surface p-5 shadow-pop ${
          // Placeholder while the drag preview moves.
          isDragging ? 'opacity-40' : ''
        } ${
          isKeyboardMoving ? 'z-10 outline-3 outline-offset-2 outline-accent' : ''
        } ${hasErrors ? 'border-danger' : 'border-edge'}`}
      >
        <div className="flex items-center gap-2">
          <AccordionTrigger>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-display text-lg font-extrabold">Question {number}</span>
              {expanded ? null : (
                <span className="truncate text-sm text-muted">
                  {/* Makes the accessible name read "Question 2: …". */}
                  <span className="sr-only">: </span>
                  {describeQuestion(question)}
                </span>
              )}
            </span>
            {hasErrors ? (
              <Badge variant="destructive">
                <span className="sr-only">, </span>Needs fixing
              </Badge>
            ) : null}
          </AccordionTrigger>
          <button
            type="button"
            ref={(node) => {
              setActivatorNodeRef(node)
              handleRef(node)
            }}
            {...attributes}
            {...listeners}
            aria-pressed={isKeyboardMoving}
            onKeyDown={onHandleKeyDown}
            onBlur={onHandleBlur}
            aria-label={`Drag to reorder question ${number}`}
            className={`grid size-11 shrink-0 touch-none place-items-center rounded-xl border-2 border-edge bg-bg text-fg hover:bg-accent/15 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <GripVerticalIcon size={20} />
          </button>
        </div>

        <AccordionContent className="flex flex-col gap-4">
          <QuestionFields index={index} onRemove={onRemove} />
        </AccordionContent>
      </li>
    </AccordionItem>
  )
}
