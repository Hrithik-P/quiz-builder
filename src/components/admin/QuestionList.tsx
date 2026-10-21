import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type Modifier,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { useWatch, type FieldArrayWithId } from 'react-hook-form'
import { useKeyboardReorder } from '../../hooks/useKeyboardReorder'
import { Accordion } from '../ui/Accordion'
import { QuestionDragPreview } from './QuestionDragPreview'
import { QuestionEditor } from './QuestionEditor'
import type { QuizDraft } from './quizDraft'

const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 })

const screenReaderInstructions = {
  draggable:
    'To reorder, press Space or Enter to pick the question up, use the up and down arrow keys to move it, then press Space or Enter to drop it, or Escape to cancel.',
}

interface QuestionListProps {
  /** From useFieldArray: `id` is react-hook-form's row key, not the question id. */
  fields: FieldArrayWithId<QuizDraft, 'questions'>[]
  /** Question id of the open question. */
  expandedId: string | null
  onExpandedChange: (id: string | null) => void
  onRemove: (index: number) => void
  /** Runs only on a successful drop. */
  onMove: (from: number, to: number) => void
}

/** Mouse and touch drags use dnd-kit; the keyboard uses useKeyboardReorder. */
export function QuestionList({
  fields,
  expandedId,
  onExpandedChange,
  onRemove,
  onMove,
}: QuestionListProps) {
  const questions = useWatch<QuizDraft, 'questions'>({ name: 'questions' })
  const indexOf = (key: UniqueIdentifier) => fields.findIndex((field) => field.id === key)

  // So a click on the handle doesn't start a drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const keyboard = useKeyboardReorder(fields, (key, to) => onMove(indexOf(key), to))

  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const moving = draggingKey !== null || keyboard.movingId !== null
  const draggingIndex = draggingKey === null ? -1 : indexOf(draggingKey)
  const dragging = questions[draggingIndex]

  const label = (key: UniqueIdentifier) => `question ${indexOf(key) + 1}`

  // Announce question numbers, not ids.
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${label(active.id)}.`,
    onDragOver: ({ over }) => (over ? `Over the position of ${label(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over
        ? `Dropped ${label(active.id)} at the position of ${label(over.id)}.`
        : `Dropped ${label(active.id)}. The order is unchanged.`,
    onDragCancel: ({ active }) => `Drag cancelled, ${label(active.id)} stays where it was.`,
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingKey(null)
    if (over && active.id !== over.id) onMove(indexOf(active.id), indexOf(over.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={({ active }) => setDraggingKey(String(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingKey(null)}
    >
      <SortableContext items={keyboard.items} strategy={verticalListSortingStrategy}>
        <Accordion
          type="single"
          collapsible
          // Collapse all while moving: a tall open card can't pass the rows below it.
          value={moving ? '' : (expandedId ?? '')}
          onValueChange={(id) => onExpandedChange(id || null)}
          asChild
        >
          <ol className="flex flex-col gap-4">
            {keyboard.items.map((field, position) => {
              // While a keyboard move previews a new order, rows still read their own form data.
              const index = indexOf(field.id)
              const questionId = questions[index]?.id
              return (
                <QuestionEditor
                  key={field.id}
                  sortableId={field.id}
                  index={index}
                  number={position + 1}
                  value={questionId ?? field.id}
                  expanded={!moving && questionId === expandedId}
                  onRemove={() => onRemove(index)}
                  isKeyboardMoving={field.id === keyboard.movingId}
                  handleRef={keyboard.registerHandle(field.id)}
                  onHandleKeyDown={(event) => keyboard.onKeyDown(field.id, event)}
                  onHandleBlur={keyboard.onBlur}
                />
              )
            })}
          </ol>
        </Accordion>
      </SortableContext>
      <DragOverlay>
        {dragging ? <QuestionDragPreview question={dragging} number={draggingIndex + 1} /> : null}
      </DragOverlay>
      <p className="sr-only" aria-live="assertive">
        {keyboard.announcement}
      </p>
    </DndContext>
  )
}
