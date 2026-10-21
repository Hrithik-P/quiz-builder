import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../../utils/cn'

/** Ink outline and a hard shadow that collapses when pressed. */
const pressable =
  'border-2 border-edge shadow-pop-sm transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-pop active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:translate-0 disabled:shadow-none'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl py-2 font-bold no-underline disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: `${pressable} bg-accent text-accent-fg`,
        secondary: `${pressable} bg-surface text-fg`,
        destructive: `${pressable} bg-danger text-bg`,
        ghost: 'border-2 border-transparent hover:border-line hover:bg-surface',
      },
      size: {
        default: 'min-h-11 px-5 text-[0.95rem]',
        sm: 'min-h-11 px-3 text-sm',
        lg: 'min-h-14 px-6 text-base',
        xl: 'min-h-16 px-8 font-display text-xl',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a router Link) with button styles. */
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
