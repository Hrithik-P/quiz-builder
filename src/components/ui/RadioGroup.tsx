import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../../utils/cn'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'grid size-5 shrink-0 place-content-center rounded-full border-2 border-edge bg-surface text-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-[state=checked]:border-accent',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2.5 rounded-full bg-current"
      />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
