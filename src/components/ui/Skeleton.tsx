import type * as React from 'react'
import { cn } from '../../utils/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-line/60', className)}
      {...props}
    />
  )
}

export { Skeleton }
