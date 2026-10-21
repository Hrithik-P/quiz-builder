import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useCountdown } from '../../hooks/useCountdown'
import type { QuestionState } from '../../types/views'
import { AttemptHeader, type AttemptTimer } from './AttemptHeader'
import { QuestionView } from './QuestionView'
import { SubmitBar } from './SubmitBar'

interface AttemptQuestionScreenProps {
  quizId: string
  quizTitle: string
  state: QuestionState
  onSubmit: (questionId: string, optionIds: string[]) => void
}

interface Selection {
  questionId: string
  optionIds: string[]
}

/** One question with its timers. Selection is tied to a question id, so it resets by itself. */
export function AttemptQuestionScreen({
  quizId,
  quizTitle,
  state,
  onSubmit,
}: AttemptQuestionScreenProps) {
  const { question, index, total, timers } = state
  const [selection, setSelection] = useState<Selection>({ questionId: '', optionIds: [] })
  const [submittedQuestionId, setSubmittedQuestionId] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const selectedOptionIds = selection.questionId === question.id ? selection.optionIds : []
  const isSubmitting = submittedQuestionId === question.id
  const isLast = index === total - 1

  // Focus each new question for keyboard and screen-reader users.
  useEffect(() => {
    headingRef.current?.focus()
  }, [question.id])

  function submit(optionIds: string[]) {
    if (isSubmitting) return
    setSubmittedQuestionId(question.id)
    try {
      onSubmit(question.id, optionIds)
    } catch (error) {
      setSubmittedQuestionId(null)
      throw error
    }
  }

  // When time runs out, the current selection is submitted (or nothing if none was made).
  const overallSecondsLeft = useCountdown(timers.overall?.endsAt ?? null, () =>
    submit(selectedOptionIds),
  )
  const questionSecondsLeft = useCountdown(timers.question?.endsAt ?? null, () =>
    submit(selectedOptionIds),
  )

  const headerTimers: AttemptTimer[] = []
  if (timers.overall && overallSecondsLeft !== null) {
    headerTimers.push({
      label: 'Quiz',
      secondsLeft: overallSecondsLeft,
      totalSeconds: timers.overall.totalSeconds,
    })
  }
  if (timers.question && questionSecondsLeft !== null) {
    headerTimers.push({
      label: 'Question',
      secondsLeft: questionSecondsLeft,
      totalSeconds: timers.question.totalSeconds,
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedOptionIds.length === 0) return
    submit(selectedOptionIds)
  }

  // Enter on a radio or checkbox doesn't submit a form natively.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    }
  }

  return (
    <section aria-label={`${quizTitle} quiz`} className="flex min-h-dvh flex-col">
      <AttemptHeader
        quizId={quizId}
        quizTitle={quizTitle}
        questionNumber={index + 1}
        total={total}
        timers={headerTimers}
      />

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pt-8 pb-6 sm:px-6 lg:pt-14"
      >
        {/* Keyed so each question replays the enter animation. */}
        <div key={question.id} className="animate-question-in">
          <QuestionView
            question={question}
            selectedOptionIds={selectedOptionIds}
            onChange={(optionIds) => setSelection({ questionId: question.id, optionIds })}
            disabled={isSubmitting}
            headingRef={headingRef}
          />
        </div>
        <SubmitBar
          label={isLast ? 'Finish quiz' : 'Lock it in'}
          disabled={isSubmitting || selectedOptionIds.length === 0}
        />
      </form>
    </section>
  )
}
