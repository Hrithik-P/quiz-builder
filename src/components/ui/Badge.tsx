import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border border-line bg-bg text-muted',
        accent: 'bg-accent/15 text-accent',
        success: 'bg-success/15 text-success',
        destructive: 'bg-danger/15 text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
