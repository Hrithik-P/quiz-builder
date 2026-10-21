import { describe, expect, it } from 'vitest'
import { rankAttempts } from '../../services/leaderboard'
import type { Attempt, User } from '../../types/models'
import { makeAttempt } from './builders'

const users: User[] = [
  { id: 'u1', name: 'Asha', country: 'IN', role: 'user' },
  { id: 'u2', name: 'Bilal', country: 'AE', role: 'user' },
  { id: 'u3', name: 'Chloe', country: 'GB', role: 'user' },
]

function completed(id: string, userId: string, score: number, timeTakenSeconds: number): Attempt {
  return makeAttempt({
    id,
    userId,
    status: 'completed',
    score,
    totalQuestions: 6,
    percentage: 0,
    timeTakenSeconds,
  })
}

describe('rankAttempts', () => {
  it('ranks by score, then faster time', () => {
    const entries = rankAttempts(
      [completed('a', 'u1', 5, 200), completed('b', 'u2', 5, 120), completed('c', 'u3', 6, 300)],
      users,
    )
    expect(entries.map((entry) => [entry.rank, entry.userName])).toEqual([
      [1, 'Chloe'],
      [2, 'Bilal'],
      [3, 'Asha'],
    ])
  })

  it('keeps only each user’s best attempt', () => {
    const entries = rankAttempts(
      [completed('a', 'u1', 3, 100), completed('b', 'u1', 5, 150), completed('c', 'u1', 5, 90)],
      users,
    )
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ attemptId: 'c', score: 5, timeTakenSeconds: 90 })
  })

  it('ignores attempts that are still in progress', () => {
    expect(rankAttempts([makeAttempt()], users)).toEqual([])
  })
})
