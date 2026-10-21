import { Skeleton } from '../ui/Skeleton'

const ROWS = 5

export function LeaderboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading leaderboard"
      className="flex max-w-4xl flex-col gap-2"
    >
      {Array.from({ length: ROWS }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  )
}
