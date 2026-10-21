import { describe, expect, it } from 'vitest'
import seedJson from '../../data/seed.json'
import type { Database } from '../../types/models'

const seed: Database = seedJson as Database

describe('seed data', () => {
  it('contains the expected records', () => {
    expect(seed.users).toHaveLength(5)
    expect(seed.countries).toHaveLength(3)
    expect(seed.quizzes).toHaveLength(5)
  })

  it('has one in-progress attempt for resume testing', () => {
    const inProgress = seed.attempts.filter((attempt) => attempt.status === 'in_progress')
    expect(inProgress.map((attempt) => attempt.id)).toEqual(['a11'])
  })
})
