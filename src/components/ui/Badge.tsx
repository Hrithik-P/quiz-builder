import type { ReactNode } from 'react'

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'ink'

const tones: Record<Tone, string> = {
  neutral: 'border border-line bg-bg text-muted',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  ink: 'bg-fg text-bg',
}

interface BadgeProps {
  tone?: Tone
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
