import type { ReactNode } from 'react'
import { displayClass, eyebrowClass } from '../../styles/styles'

interface PageHeaderProps {
  headingId: string
  title: ReactNode
  eyebrow?: ReactNode
  /** A string renders as muted text. */
  description?: ReactNode
  actions?: ReactNode
  size?: 'lg' | 'md'
}

const titleSizes = {
  lg: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-4xl sm:text-5xl',
}

export function PageHeader({
  headingId,
  title,
  eyebrow,
  description,
  actions,
  size = 'lg',
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow ? <p className={eyebrowClass}>{eyebrow}</p> : null}
        <h1 id={headingId} className={`${displayClass} leading-[1.02] ${titleSizes[size]}`}>
          {title}
        </h1>
        {typeof description === 'string' ? (
          <p className="text-muted">{description}</p>
        ) : (
          description
        )}
      </div>
      {actions}
    </div>
  )
}
