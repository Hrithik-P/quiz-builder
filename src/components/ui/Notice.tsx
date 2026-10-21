import type { ComponentType, ReactNode } from 'react'

type Tone = 'accent' | 'neutral'

const tones: Record<Tone, string> = {
  accent: 'border-accent bg-accent/10 font-medium',
  neutral: 'border-line bg-surface',
}

interface NoticeProps {
  tone?: Tone
  icon?: ComponentType<{ size?: number; className?: string }>
  children: ReactNode
}

export function Notice({ tone = 'neutral', icon: Icon, children }: NoticeProps) {
  return (
    <p
      role="status"
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-sm ${tones[tone]}`}
    >
      {Icon ? <Icon size={18} className="mt-0.5 shrink-0 text-accent" /> : null}
      <span>{children}</span>
    </p>
  )
}
