interface ProgressBarProps {
  value: number
  max: number
  label: string
}

/** Above this, segments get too thin, so use one continuous bar. */
const MAX_SEGMENTS = 15

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="w-full"
    >
      {max <= MAX_SEGMENTS ? (
        <div className="flex gap-1.5">
          {Array.from({ length: max }, (_segment, index) => (
            <span
              key={index}
              className={`h-2.5 flex-1 rounded-full transition-colors duration-300 ${
                index + 1 < value
                  ? 'bg-fg'
                  : index + 1 === value
                    ? 'border-2 border-edge bg-accent'
                    : 'bg-line'
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="h-2.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
