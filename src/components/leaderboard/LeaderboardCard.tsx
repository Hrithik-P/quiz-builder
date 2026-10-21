import { Link } from 'react-router'
import { InfoIcon } from 'lucide-react'
import { eyebrowClass } from '../../styles/styles'
import type { LeaderboardEntry } from '../../types/views'
import { LeaderboardList } from './LeaderboardList'

interface LeaderboardCardProps {
  quizId: string
  quizTitle: string
  ranked: LeaderboardEntry[]
  currentUserId: string
  limit: number
}

/** Keeps the current user visible even outside the top `limit`. */
export function LeaderboardCard({
  quizId,
  quizTitle,
  ranked,
  currentUserId,
  limit,
}: LeaderboardCardProps) {
  const top = ranked.slice(0, limit)
  const myEntry = ranked.find((e) => e.userId === currentUserId)

  return (
    <div className="flex max-w-4xl flex-col gap-3 rounded-3xl border-2 border-edge bg-surface p-3 sm:p-4">
      <h2 className={`${eyebrowClass} px-1 pt-1`}>
        {quizTitle} · {ranked.length} {ranked.length === 1 ? 'player' : 'players'}
      </h2>
      <LeaderboardList
        entries={top}
        currentUserId={currentUserId}
        currentUserEntry={myEntry && myEntry.rank > limit ? myEntry : undefined}
      />
      <p className="flex items-center gap-2 px-1 text-sm text-muted">
        <InfoIcon size={16} />
        Ties go to the faster finish.
      </p>
      {myEntry ? null : (
        <p className="px-1 text-sm">
          You have not completed this quiz yet.{' '}
          <Link to={`/quiz/${quizId}`} className="font-bold text-accent underline">
            Take it now
          </Link>
        </p>
      )}
    </div>
  )
}
