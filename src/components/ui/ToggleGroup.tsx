import type { VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../../utils/cn'
import { toggleVariants } from './Toggle'

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({})

function ToggleGroup({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const { variant } = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants({ variant }), className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
