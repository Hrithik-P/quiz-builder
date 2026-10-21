import type { Ref } from 'react'
import { CheckIcon, CircleDotIcon, SquareCheckIcon } from 'lucide-react'
import type { PublicQuestion } from '../../types/views'

interface QuestionViewProps {
  question: PublicQuestion
  selectedOptionIds: string[]
  onChange: (optionIds: string[]) => void
  disabled?: boolean
  /** Focused when a new question appears. */
  headingRef?: Ref<HTMLHeadingElement>
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function QuestionView({
  question,
  selectedOptionIds,
  onChange,
  disabled = false,
  headingRef,
}: QuestionViewProps) {
  const isMultiple = question.type === 'multiple'

  function toggle(optionId: string, checked: boolean) {
    if (!isMultiple) {
      onChange([optionId])
      return
    }
    onChange(
      checked
        ? [...selectedOptionIds, optionId]
        : selectedOptionIds.filter((id) => id !== optionId),
    )
  }

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="contents">
        <h2
          ref={headingRef}
          tabIndex={-1}
          // wrap-anywhere lets one very long word break instead of pushing the page wider than the screen.
          className="font-display text-[1.75rem] leading-[1.12] font-extrabold tracking-tight wrap-anywhere outline-none sm:text-4xl lg:text-[2.75rem]"
        >
          {question.text}
        </h2>
      </legend>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-sm font-bold text-accent">
        {isMultiple ? <SquareCheckIcon size={15} /> : <CircleDotIcon size={15} />}
        {isMultiple ? 'Pick all that apply' : 'Pick one answer'}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {question.options.map((option, index) => (
          <label
            key={option.id}
            className="group relative flex min-h-16 cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-edge bg-surface p-2.5 pr-4 shadow-pop transition-[transform,box-shadow,background-color] hover:-translate-x-px hover:-translate-y-px hover:shadow-pop-lg has-checked:translate-x-0.5 has-checked:translate-y-0.5 has-checked:bg-accent has-checked:text-accent-fg has-checked:shadow-pop-sm has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed sm:min-h-20"
          >
            <input
              type={isMultiple ? 'checkbox' : 'radio'}
              name={question.id}
              value={option.id}
              checked={selectedOptionIds.includes(option.id)}
              onChange={(event) => toggle(option.id, event.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-edge bg-bg font-display text-lg font-extrabold text-fg peer-checked:border-transparent peer-checked:bg-surface sm:size-12 sm:text-xl"
            >
              {LETTERS[index] ?? index + 1}
            </span>
            {option.imageUrl && (
              <img src={option.imageUrl} alt="" className="size-16 rounded-lg object-cover" />
            )}
            <span className="min-w-0 flex-1 text-[1.05rem] font-semibold wrap-anywhere sm:text-lg">
              {option.text}
            </span>
            <CheckIcon size={22} className="hidden shrink-0 peer-checked:block" />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
