import { describe, expect, it } from 'vitest'
import type { Database } from '../types/models'
import seedJson from './seed.json'

const seed: Database = seedJson as Database

describe('seed data', () => {
  it('contains the expected records', () => {
    expect(seed.users).toHaveLength(5)
    expect(seed.countries).toHaveLength(3)
    expect(seed.quizzes).toHaveLength(5)
  })

  it('has one in-progress attempt for resume testing', () => {
    const inProgress = seed.attempts.filter((a) => a.status === 'in_progress')
    expect(inProgress.map((a) => a.id)).toEqual(['a11'])
  })
})
