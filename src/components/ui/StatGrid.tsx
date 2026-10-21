import { StatCard, type StatCardProps } from './StatCard'

interface StatGridProps {
  stats: StatCardProps[]
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <dl className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </dl>
  )
}
