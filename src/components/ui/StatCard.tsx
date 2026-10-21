export interface StatCardProps {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger'
}

const toneClass = {
  default: '',
  success: 'text-success',
  danger: 'text-danger',
}

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className="flex flex-col-reverse gap-1 rounded-2xl border-2 border-edge bg-surface p-3 sm:p-4">
      <dt className="text-xs font-semibold text-muted sm:text-sm">{label}</dt>
      <dd
        className={`font-display text-2xl leading-none font-extrabold tabular-nums sm:text-3xl ${toneClass[tone]}`}
      >
        {value}
      </dd>
    </div>
  )
}
