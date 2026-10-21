import type * as React from 'react'
import { cn } from '../../utils/cn'
import { fieldClass } from './Input'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn(fieldClass, className)} {...props} />
}

export { Textarea }
