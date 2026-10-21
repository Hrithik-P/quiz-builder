import type { Attempt, User } from '../types/models'
import type { LeaderboardEntry } from '../types/views'
import { toPercentage } from './scoring'

type CompletedAttempt = Attempt & { score: number; timeTakenSeconds: number }

function isCompleted(attempt: Attempt): attempt is CompletedAttempt {
  return (
    attempt.status === 'completed' && attempt.score !== null && attempt.timeTakenSeconds !== null
  )
}

/** Higher score first; on a tie the faster time wins. */
function compareAttempts(first: CompletedAttempt, second: CompletedAttempt): number {
  return second.score - first.score || first.timeTakenSeconds - second.timeTakenSeconds
}

/** One row per user (their best attempt), ranked by position. */
export function rankAttempts(attempts: Attempt[], users: User[]): LeaderboardEntry[] {
  const bestByUser = new Map<string, CompletedAttempt>()
  for (const attempt of attempts.filter(isCompleted)) {
    const best = bestByUser.get(attempt.userId)
    if (!best || compareAttempts(attempt, best) < 0) bestByUser.set(attempt.userId, attempt)
  }

  return [...bestByUser.values()].sort(compareAttempts).map((attempt, position) => ({
    rank: position + 1,
    attemptId: attempt.id,
    userId: attempt.userId,
    userName: users.find((user) => user.id === attempt.userId)?.name ?? 'Unknown user',
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage ?? toPercentage(attempt.score, attempt.totalQuestions),
    timeTakenSeconds: attempt.timeTakenSeconds,
  }))
}
