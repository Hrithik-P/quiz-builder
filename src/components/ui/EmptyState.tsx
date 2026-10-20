import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-edge/40 bg-surface/60 px-4 py-12 text-center">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}
