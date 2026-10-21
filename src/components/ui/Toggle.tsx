import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../../utils/cn'

/** Pill chips: `default` fills with ink when on, `accent` with the brand colour. */
const toggleVariants = cva(
  'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-edge px-4 text-sm font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger',
  {
    variants: {
      variant: {
        default: 'hover:bg-surface data-[state=on]:bg-fg data-[state=on]:text-bg',
        accent: 'bg-surface data-[state=on]:bg-accent data-[state=on]:text-accent-fg',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Toggle({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
