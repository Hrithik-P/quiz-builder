import { CheckIcon } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../../utils/cn'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer grid size-5 shrink-0 place-content-center rounded-md border-2 border-edge bg-surface text-accent-fg disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-[state=checked]:border-accent data-[state=checked]:bg-accent',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator">
        <CheckIcon className="size-3.5" strokeWidth={3.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
