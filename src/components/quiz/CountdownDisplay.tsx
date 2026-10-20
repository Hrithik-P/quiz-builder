import { formatClock } from '../../utils/format'
import { Ring } from '../ui/Ring'

interface CountdownDisplayProps {
  label: string
  secondsLeft: number
  /** The full allowance, so the ring can show how much is left. */
  totalSeconds: number
  /** Turns red and is announced to screen readers at or below this many seconds. */
  warnAt?: number
}

const ANNOUNCE_AT = new Set([60, 30, 10])

/** A ring countdown pill: the arc drains as time runs out. */
export function CountdownDisplay({
  label,
  secondsLeft,
  totalSeconds,
  warnAt = 30,
}: CountdownDisplayProps) {
  const warning = secondsLeft <= warnAt
  const announcement = ANNOUNCE_AT.has(secondsLeft) ? `${label}: ${secondsLeft} seconds left` : ''

  return (
    <div
      className={`flex min-h-13 items-center gap-2 rounded-full border-2 border-edge py-1 pr-4 pl-1 transition-colors ${
        warning ? 'bg-danger/15 text-danger' : 'bg-surface'
      }`}
    >
      <Ring
        fraction={totalSeconds > 0 ? secondsLeft / totalSeconds : 0}
        size={40}
        strokeWidth={6}
        arcClass={warning ? 'stroke-danger' : 'stroke-accent'}
      />
      <span className="flex flex-col leading-none">
        <span className="text-[0.65rem] font-bold tracking-[0.08em] uppercase opacity-80">
          {label}
        </span>
        <span className="font-display text-xl font-extrabold tabular-nums" aria-hidden="true">
          {formatClock(secondsLeft)}
        </span>
      </span>
      <span className="sr-only">
        {label} time: {formatClock(secondsLeft)} remaining
      </span>
      <span className="sr-only" aria-live="assertive">
        {announcement}
      </span>
    </div>
  )
}
