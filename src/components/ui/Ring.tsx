import type { ReactNode } from 'react'

interface RingProps {
  /** 0 to 1: how much of the ring is filled. */
  fraction: number
  size: number
  strokeWidth: number
  /** Tailwind stroke class for the filled arc, e.g. "stroke-accent". */
  arcClass: string
  trackClass?: string
  children?: ReactNode
}

/** A circular progress ring with content in the middle. Decorative: label the content instead. */
export function Ring({
  fraction,
  size,
  strokeWidth,
  arcClass,
  trackClass = 'stroke-line',
  children,
}: RingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, fraction))

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className={`${arcClass} transition-[stroke-dashoffset] duration-500`}
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}
