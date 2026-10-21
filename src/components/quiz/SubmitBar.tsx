import { ArrowRightIcon } from 'lucide-react'
import { Button } from '../ui/Button'

interface SubmitBarProps {
  label: string
  disabled: boolean
}

export function SubmitBar({ label, disabled }: SubmitBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-auto flex items-center justify-end gap-4 bg-bg/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <p className="hidden text-sm text-muted sm:block">
        Press{' '}
        <kbd className="rounded-md border-2 border-line bg-surface px-1.5 font-sans text-xs font-bold text-fg">
          Enter
        </kbd>{' '}
        to submit
      </p>
      <Button type="submit" size="xl" className="w-full sm:w-auto" disabled={disabled}>
        {label}
        <ArrowRightIcon size={22} />
      </Button>
    </div>
  )
}
