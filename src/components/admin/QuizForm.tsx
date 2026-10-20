import { useState, type FormEvent } from 'react'
import type { Country, Question } from '../../types/models'
import { Button, ButtonLink } from '../ui/Button'
import { cardClass, inputClass, labelClass } from '../ui/styles'
import { QuestionEditor } from './QuestionEditor'
import { createQuestion, hasErrors, validateQuiz, type QuizDraft } from './quizDraft'

interface QuizFormProps {
  initial: QuizDraft
  countries: Country[]
  submitLabel: string
  onSubmit: (draft: QuizDraft) => void
}

/** Shared by the Add and Edit pages. */
export function QuizForm({ initial, countries, submitLabel, onSubmit }: QuizFormProps) {
  const [draft, setDraft] = useState(initial)
  const [showErrors, setShowErrors] = useState(false)
  const errors = validateQuiz(draft)
  const visible = showErrors ? errors : { byQuestion: {} }

  function update<K extends keyof QuizDraft>(key: K, value: QuizDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function updateQuestion(index: number, question: Question) {
    update(
      'questions',
      draft.questions.map((q, i) => (i === index ? question : q)),
    )
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction
    const questions = [...draft.questions]
    const [moved] = questions.splice(index, 1)
    if (!moved || target < 0 || target > questions.length) return
    questions.splice(target, 0, moved)
    update('questions', questions)
  }

  function toggleCountry(code: string, checked: boolean) {
    update(
      'countries',
      checked ? [...draft.countries, code] : draft.countries.filter((c) => c !== code),
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowErrors(true)
    if (!hasErrors(errors)) onSubmit(draft)
  }

  const showSummary = showErrors && hasErrors(errors)

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {showSummary && (
        <p role="alert" className="rounded-lg border border-danger bg-danger/10 p-3 text-danger">
          Please fix the highlighted errors before saving.
        </p>
      )}

      <section className={`${cardClass} flex flex-col gap-4`} aria-labelledby="details-heading">
        <h2 id="details-heading" className="font-display text-xl font-extrabold">
          Details
        </h2>
        <div>
          <label htmlFor="quiz-title" className={labelClass}>
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="quiz-title"
            className={inputClass}
            value={draft.title}
            onChange={(event) => update('title', event.target.value)}
            aria-invalid={visible.title ? true : undefined}
            aria-describedby={visible.title ? 'quiz-title-error' : undefined}
          />
          {visible.title && (
            <p id="quiz-title-error" className="mt-1 text-sm text-danger">
              {visible.title}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="quiz-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="quiz-description"
            rows={3}
            className={inputClass}
            value={draft.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quiz-time-limit" className={labelClass}>
              Overall time limit (minutes)
            </label>
            <input
              id="quiz-time-limit"
              type="number"
              min={0}
              step={0.5}
              inputMode="decimal"
              placeholder="No limit"
              className={inputClass}
              value={draft.timeLimitSeconds === null ? '' : draft.timeLimitSeconds / 60}
              onChange={(event) =>
                update(
                  'timeLimitSeconds',
                  event.target.value === '' ? null : Math.round(Number(event.target.value) * 60),
                )
              }
            />
          </div>
          <div>
            <label htmlFor="quiz-per-question" className={labelClass}>
              Time per question (seconds)
            </label>
            <input
              id="quiz-per-question"
              type="number"
              min={0}
              step={5}
              inputMode="numeric"
              placeholder="No limit"
              className={inputClass}
              value={draft.perQuestionSeconds ?? ''}
              onChange={(event) =>
                update(
                  'perQuestionSeconds',
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            />
          </div>
        </div>
        {visible.timeLimit && <p className="text-sm text-danger">{visible.timeLimit}</p>}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="size-5 accent-accent"
            checked={draft.retakesAllowed}
            onChange={(event) => update('retakesAllowed', event.target.checked)}
          />
          Allow retakes
        </label>

        <fieldset>
          <legend className={labelClass}>Assigned countries</legend>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <label
                key={country.code}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-edge bg-surface px-4 py-2 font-semibold has-checked:bg-accent has-checked:text-accent-fg has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-accent"
                  checked={draft.countries.includes(country.code)}
                  onChange={(event) => toggleCountry(country.code, event.target.checked)}
                />
                {country.name}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="questions-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="questions-heading" className="font-display text-xl font-extrabold">
            Questions ({draft.questions.length})
          </h2>
        </div>
        {visible.questions && <p className="text-sm text-danger">{visible.questions}</p>}
        {draft.questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            total={draft.questions.length}
            errors={visible.byQuestion[question.id]}
            onChange={(q) => updateQuestion(index, q)}
            onRemove={() =>
              update(
                'questions',
                draft.questions.filter((q) => q.id !== question.id),
              )
            }
            onMove={(direction) => moveQuestion(index, direction)}
          />
        ))}
        <Button
          variant="secondary"
          className="self-start"
          onClick={() => update('questions', [...draft.questions, createQuestion()])}
        >
          + Add question
        </Button>
      </section>

      <div className="sticky bottom-24 z-10 flex justify-end gap-2 rounded-2xl border-2 border-edge bg-surface/95 p-3 shadow-pop backdrop-blur lg:bottom-4">
        <ButtonLink to="/admin" variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
