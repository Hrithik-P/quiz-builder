import { ErrorMessage } from '@hookform/error-message'
import { XIcon } from 'lucide-react'
import { useId, type Ref } from 'react'
import { useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/Form'
import { Input } from '../ui/Input'
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { ListError } from './ListError'
import { createOption, type QuizDraft } from './quizDraft'

interface QuestionFieldsProps {
  index: number
  onRemove: () => void
}

const correctClass = 'mt-3 data-[state=checked]:border-success'

/** The inputs of an open question in the builder. */
export function QuestionFields({ index, onRemove }: QuestionFieldsProps) {
  const name = `questions.${index}` as const
  const optionsLabelId = useId()
  const { control, getValues, setValue, trigger } = useFormContext<QuizDraft>()
  const { errors, isSubmitted } = useFormState({ control, name })
  const question = useWatch({ control, name })
  const options = useFieldArray({ control, name: `${name}.options` })

  const isSingle = question.type === 'single'

  function removeOption(optionIndex: number) {
    const optionId = getValues(`${name}.options.${optionIndex}.id`)
    options.remove(optionIndex)
    setValue(
      `${name}.correctOptionIds`,
      getValues(`${name}.correctOptionIds`).filter((id) => id !== optionId),
      { shouldDirty: true, shouldValidate: isSubmitted },
    )
  }

  function onTypeChange(type: string) {
    // Single choice keeps only the first correct option.
    if (type === 'single') {
      setValue(`${name}.correctOptionIds`, getValues(`${name}.correctOptionIds`).slice(0, 1), {
        shouldValidate: isSubmitted,
      })
    } else if (isSubmitted) {
      void trigger(`${name}.correctOptionIds`)
    }
  }

  function optionRows(
    correct: string[],
    onCorrectChange: (ids: string[]) => void,
    ref: Ref<HTMLButtonElement>,
  ) {
    return options.fields.map((option, optionIndex) => {
      const optionId = question.options[optionIndex]?.id ?? ''
      const label = `Option ${optionIndex + 1} is correct`
      return (
        <div key={option.id} className="flex items-start gap-2">
          {isSingle ? (
            <RadioGroupItem
              ref={optionIndex === 0 ? ref : undefined}
              value={optionId}
              aria-label={label}
              className={`${correctClass} text-success`}
            />
          ) : (
            <Checkbox
              ref={optionIndex === 0 ? ref : undefined}
              aria-label={label}
              checked={correct.includes(optionId)}
              onCheckedChange={(checked) =>
                onCorrectChange(
                  checked === true
                    ? [...correct, optionId]
                    : correct.filter((id) => id !== optionId),
                )
              }
              className={`${correctClass} data-[state=checked]:bg-success`}
            />
          )}
          <FormField
            control={control}
            name={`${name}.options.${optionIndex}.text`}
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1">
                <FormControl>
                  <Input
                    {...field}
                    placeholder={`Option ${optionIndex + 1}`}
                    aria-label={`Option ${optionIndex + 1} text`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeOption(optionIndex)}
            aria-label={`Remove option ${optionIndex + 1}`}
          >
            <XIcon size={18} />
          </Button>
        </div>
      )
    })
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <FormField
          control={control}
          name={`${name}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question text</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${name}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer type</FormLabel>
              <Select
                value={field.value}
                onValueChange={(type) => {
                  field.onChange(type)
                  onTypeChange(type)
                }}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">Single choice</SelectItem>
                  <SelectItem value="multiple">Multiple choice</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`${name}.correctOptionIds`}
        render={({ field }) => (
          <FormItem>
            <p id={optionsLabelId} className="mb-1 text-sm font-semibold">
              Options{' '}
              <span className="font-normal text-muted">
                ({isSingle ? 'select the correct one' : 'tick every correct one'})
              </span>
            </p>
            <FormControl>
              {isSingle ? (
                <RadioGroup
                  aria-labelledby={optionsLabelId}
                  value={field.value[0] ?? ''}
                  onValueChange={(id) => field.onChange([id])}
                  className="gap-2"
                >
                  {optionRows(field.value, field.onChange, field.ref)}
                </RadioGroup>
              ) : (
                <div role="group" aria-labelledby={optionsLabelId} className="grid gap-2">
                  {optionRows(field.value, field.onChange, field.ref)}
                </div>
              )}
            </FormControl>
            <ErrorMessage errors={errors} name={`${name}.options.root`} render={ListError} />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            options.append(createOption(), {
              focusName: `${name}.options.${options.fields.length}.text`,
            })
          }
        >
          + Add option
        </Button>
        <Button variant="ghost" className="text-danger" onClick={onRemove}>
          Remove question
        </Button>
      </div>
    </>
  )
}
