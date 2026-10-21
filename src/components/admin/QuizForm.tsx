import { Link } from 'react-router'
import { ErrorMessage } from '@hookform/error-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useState } from 'react'
import { useFieldArray, useForm, type FieldErrors, type FieldPath } from 'react-hook-form'
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard'
import { cardClass } from '../../styles/styles'
import type { Country } from '../../types/models'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/Form'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { ToggleGroup, ToggleGroupItem } from '../ui/ToggleGroup'
import { ListError } from './ListError'
import { QuestionList } from './QuestionList'
import { createQuestion, type QuizDraft } from './quizDraft'
import { quizSchema } from './quizSchema'

interface QuizFormProps {
  initial: QuizDraft
  countries: Country[]
  submitLabel: string
  onSubmit: (draft: QuizDraft) => void
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-danger">
      {' *'}
    </span>
  )
}

const TOP_LEVEL_FIELDS = ['title', 'timeLimitSeconds', 'perQuestionSeconds', 'countries'] as const

/** The first field with an error in question `index`, to focus after a failed save. */
function firstQuestionError(
  errors: FieldErrors<QuizDraft>,
  index: number,
): FieldPath<QuizDraft> | null {
  const question = errors.questions?.[index]
  if (!question) return null
  if (question.text) return `questions.${index}.text`
  const options = question.options
  for (let j = 0; Array.isArray(options) && j < options.length; j++) {
    if (options[j]?.text) return `questions.${index}.options.${j}.text`
  }
  return `questions.${index}.correctOptionIds`
}

export function QuizForm({ initial, countries, submitLabel, onSubmit }: QuizFormProps) {
  const form = useForm({
    defaultValues: initial,
    resolver: zodResolver(quizSchema),
    // Collapsed questions aren't mounted, so focusing is done in handleInvalid.
    shouldFocusError: false,
  })
  const { control, formState, getValues, setFocus } = form
  const { errors, isDirty, submitCount } = formState
  const questions = useFieldArray({ control, name: 'questions' })
  const countriesLabelId = useId()

  // Accordion: one open question at a time, tracked by question id.
  const [expandedId, setExpandedId] = useState<string | null>(initial.questions[0]?.id ?? null)
  // Set together with the question to open, so the field is mounted when the effect runs.
  const [focusRequest, setFocusRequest] = useState<{ path: FieldPath<QuizDraft> } | null>(null)
  const guard = useUnsavedChangesGuard(isDirty)

  useEffect(() => {
    if (focusRequest) setFocus(focusRequest.path)
  }, [focusRequest, setFocus])

  function addQuestion() {
    const question = createQuestion()
    questions.append(question, { shouldFocus: false })
    setExpandedId(question.id)
  }

  function removeQuestion(index: number) {
    if (getValues(`questions.${index}.id`) === expandedId) setExpandedId(null)
    questions.remove(index)
  }

  function handleValid(draft: QuizDraft) {
    guard.allowLeave()
    onSubmit(draft)
  }

  function handleInvalid(invalid: FieldErrors<QuizDraft>) {
    const topField = TOP_LEVEL_FIELDS.find((name) => invalid[name])
    if (topField) {
      setFocus(topField)
      return
    }
    const index = questions.fields.findIndex((_, i) => invalid.questions?.[i])
    const path = firstQuestionError(invalid, index)
    if (!path) return
    setExpandedId(getValues(`questions.${index}.id`))
    setFocusRequest({ path })
  }

  const invalidNumbers = questions.fields
    .map((_, i) => (errors.questions?.[i] ? i + 1 : null))
    .filter((n) => n !== null)
  const showSummary = submitCount > 0 && Object.keys(errors).length > 0

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleValid, handleInvalid)}
        className="flex flex-col gap-6"
      >
        {showSummary ? (
          <p role="alert" className="rounded-lg border border-danger bg-danger/10 p-3 text-danger">
            Please fix the highlighted errors before saving
            {invalidNumbers.length > 0
              ? ` (question${invalidNumbers.length > 1 ? 's' : ''} ${invalidNumbers.join(', ')})`
              : ''}
            .
          </p>
        ) : null}

        <section className={`${cardClass} flex flex-col gap-4`} aria-labelledby="details-heading">
          <h2 id="details-heading" className="font-display text-xl font-extrabold">
            Details
          </h2>
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input {...field} aria-required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="timeLimitSeconds"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Overall time limit (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step={0.5}
                      inputMode="decimal"
                      placeholder="No limit"
                      // Stored in seconds, edited in minutes.
                      value={value === null ? '' : value / 60}
                      onChange={(event) =>
                        onChange(
                          event.target.value === ''
                            ? null
                            : Math.round(Number(event.target.value) * 60),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="perQuestionSeconds"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Time per question (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step={5}
                      inputMode="numeric"
                      placeholder="No limit"
                      value={value ?? ''}
                      onChange={(event) =>
                        onChange(event.target.value === '' ? null : Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="retakesAllowed"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <FormLabel className="mb-0 font-normal">Allow retakes</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="countries"
            render={({ field }) => (
              <FormItem>
                <p id={countriesLabelId} className="mb-1 text-sm font-semibold">
                  Assigned countries
                  <RequiredMark />
                </p>
                <FormControl>
                  <ToggleGroup
                    type="multiple"
                    variant="accent"
                    aria-labelledby={countriesLabelId}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {countries.map((country, i) => (
                      <ToggleGroupItem
                        key={country.code}
                        value={country.code}
                        ref={i === 0 ? field.ref : undefined}
                      >
                        {country.name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="questions-heading">
          <h2 id="questions-heading" className="font-display text-xl font-extrabold">
            Questions ({questions.fields.length})
          </h2>
          <ErrorMessage errors={errors} name="questions.root" render={ListError} />
          <QuestionList
            fields={questions.fields}
            expandedId={expandedId}
            onExpandedChange={setExpandedId}
            onRemove={removeQuestion}
            onMove={questions.move}
          />
          <Button variant="secondary" className="self-start" onClick={addQuestion}>
            + Add question
          </Button>
        </section>

        <div className="sticky bottom-24 z-10 flex justify-end gap-2 rounded-2xl border-2 border-edge bg-surface/95 p-3 shadow-pop backdrop-blur lg:bottom-4">
          <Button asChild variant="secondary">
            <Link to="/admin">Cancel</Link>
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>

        <ConfirmDialog
          open={guard.blocked}
          title="Leave without saving?"
          message="Your changes to this quiz have not been saved and will be lost."
          confirmLabel="Leave"
          onConfirm={guard.proceed}
          onCancel={guard.stay}
        />
      </form>
    </Form>
  )
}
