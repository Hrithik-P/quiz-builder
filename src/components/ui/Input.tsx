import type * as React from 'react'
import { cn } from '../../utils/cn'

export const fieldClass =
  'w-full min-w-0 rounded-xl border-2 border-edge bg-surface px-3 py-2 text-fg placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger focus-visible:outline-2 focus-visible:outline-offset-0'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input data-slot="input" className={cn(fieldClass, 'min-h-11', className)} {...props} />
}

export { Input }
