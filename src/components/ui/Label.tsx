import { Label as LabelPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../../utils/cn'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('block text-sm font-semibold select-none', className)}
      {...props}
    />
  )
}

export { Label }
