import { useId } from 'react'
import type { Question, QuestionType } from '../../types/models'
import { buttonClass, cardClass, inputClass, labelClass } from '../ui/styles'
import { createOption, type QuestionErrors } from './quizDraft'

interface QuestionEditorProps {
  question: Question
  index: number
  total: number
  errors?: QuestionErrors
  onChange: (question: Question) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {message}
    </p>
  )
}

export function QuestionEditor({
  question,
  index,
  total,
  errors,
  onChange,
  onRemove,
  onMove,
}: QuestionEditorProps) {
  const baseId = useId()
  const number = index + 1
  const isSingle = question.type === 'single'

  function setType(type: QuestionType) {
    // Switching to single-choice keeps only the first correct option.
    const correctOptionIds =
      type === 'single' ? question.correctOptionIds.slice(0, 1) : question.correctOptionIds
    onChange({ ...question, type, correctOptionIds })
  }

  function setOptionText(optionId: string, text: string) {
    onChange({
      ...question,
      options: question.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
    })
  }

  function setCorrect(optionId: string, checked: boolean) {
    const correctOptionIds = isSingle
      ? [optionId]
      : checked
        ? [...question.correctOptionIds, optionId]
        : question.correctOptionIds.filter((id) => id !== optionId)
    onChange({ ...question, correctOptionIds })
  }

  function removeOption(optionId: string) {
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== optionId),
      correctOptionIds: question.correctOptionIds.filter((id) => id !== optionId),
    })
  }

  return (
    <fieldset className={`${cardClass} flex min-w-0 flex-col gap-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <legend className="contents">
          <h3 className="font-display text-lg font-extrabold">Question {number}</h3>
        </legend>
        <div className="flex gap-1">
          <button
            type="button"
            className={buttonClass('ghost', '', 'sm')}
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move question ${number} up`}
          >
            ↑
          </button>
          <button
            type="button"
            className={buttonClass('ghost', '', 'sm')}
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move question ${number} down`}
          >
            ↓
          </button>
          <button
            type="button"
            className={buttonClass('ghost', 'text-danger', 'sm')}
            onClick={onRemove}
            aria-label={`Remove question ${number}`}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor={`${baseId}-text`} className={labelClass}>
            Question text
          </label>
          <textarea
            id={`${baseId}-text`}
            rows={2}
            className={inputClass}
            value={question.text}
            onChange={(event) => onChange({ ...question, text: event.target.value })}
            aria-invalid={errors?.text ? true : undefined}
            aria-describedby={errors?.text ? `${baseId}-text-error` : undefined}
          />
          <FieldError id={`${baseId}-text-error`} message={errors?.text} />
        </div>
        <div>
          <label htmlFor={`${baseId}-type`} className={labelClass}>
            Answer type
          </label>
          <select
            id={`${baseId}-type`}
            className={inputClass}
            value={question.type}
            onChange={(event) => setType(event.target.value as QuestionType)}
          >
            <option value="single">Single choice</option>
            <option value="multiple">Multiple choice</option>
          </select>
        </div>
      </div>

      <div>
        <p className={labelClass}>
          Options{' '}
          <span className="font-normal text-muted">
            ({isSingle ? 'select the correct one' : 'tick every correct one'})
          </span>
        </p>
        <ul className="flex flex-col gap-2">
          {question.options.map((option, optionIndex) => (
            <li key={option.id} className="flex items-center gap-2">
              <input
                type={isSingle ? 'radio' : 'checkbox'}
                name={`${baseId}-correct`}
                checked={question.correctOptionIds.includes(option.id)}
                onChange={(event) => setCorrect(option.id, event.target.checked)}
                aria-label={`Option ${optionIndex + 1} is correct`}
                className="size-5 shrink-0 accent-success"
              />
              <input
                type="text"
                className={inputClass}
                value={option.text}
                placeholder={`Option ${optionIndex + 1}`}
                onChange={(event) => setOptionText(option.id, event.target.value)}
                aria-label={`Option ${optionIndex + 1} text`}
              />
              <button
                type="button"
                className={buttonClass('ghost', 'shrink-0', 'sm')}
                onClick={() => removeOption(option.id)}
                aria-label={`Remove option ${optionIndex + 1}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <FieldError id={`${baseId}-options-error`} message={errors?.options} />
        <FieldError id={`${baseId}-correct-error`} message={errors?.correct} />
        <button
          type="button"
          className={buttonClass('secondary', 'mt-3')}
          onClick={() => onChange({ ...question, options: [...question.options, createOption()] })}
        >
          + Add option
        </button>
      </div>
    </fieldset>
  )
}
