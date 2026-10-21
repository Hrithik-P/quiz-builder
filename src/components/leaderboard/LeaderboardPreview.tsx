import { Link } from 'react-router'
import { ArrowRightIcon } from 'lucide-react'
import type { LeaderboardEntry } from '../../types/views'
import { QuizTile } from '../quiz/QuizTile'
import { LeaderboardList } from './LeaderboardList'

interface LeaderboardPreviewProps {
  quizId: string
  quizTitle: string
  ranked: LeaderboardEntry[]
  currentUserId: string
  rows?: number
}

export function LeaderboardPreview({
  quizId,
  quizTitle,
  ranked,
  currentUserId,
  rows = 4,
}: LeaderboardPreviewProps) {
  const myEntry = ranked.find((e) => e.userId === currentUserId)

  return (
    <div className="flex flex-col gap-3 rounded-3xl border-2 border-edge bg-surface p-4 shadow-pop sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 font-display text-xl font-extrabold">
          <QuizTile quizId={quizId} title={quizTitle} className="size-9 rounded-xl text-sm" />
          {myEntry ? `You're #${myEntry.rank}` : 'Leaderboard'}
        </h2>
        <Link
          to={`/leaderboard/${quizId}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold"
        >
          Full leaderboard
          <ArrowRightIcon size={16} />
        </Link>
      </div>
      <LeaderboardList entries={ranked.slice(0, rows)} currentUserId={currentUserId} />
    </div>
  )
}
