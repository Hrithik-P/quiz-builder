import { ChevronDownIcon } from 'lucide-react'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '../../utils/cn'

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem(props: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" {...props} />
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="min-w-0 flex-1">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex min-h-11 w-full items-center gap-3 rounded-xl text-left [&[data-state=open]>svg]:rotate-0',
          className,
        )}
        {...props}
      >
        <ChevronDownIcon className="size-4.5 shrink-0 -rotate-90 transition-transform" />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      // Closes instantly: dragging collapses the open question and needs the short height at once.
      className="overflow-hidden data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pt-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
