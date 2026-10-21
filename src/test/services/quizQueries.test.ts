import { describe, expect, it } from 'vitest'
import { getAttemptFor } from '../../services/quizQueries'
import type { QuizData } from '../../types/models'
import { makeAttempt, makeQuiz } from './builders'

const data: QuizData = {
  countries: [],
  users: [],
  quizzes: [makeQuiz()],
  attempts: [makeAttempt({ id: 'attempt-1', quizId: 'quiz-1', userId: 'u1' })],
}

describe('getAttemptFor', () => {
  it('returns the attempt when it is this user’s attempt at this quiz', () => {
    expect(getAttemptFor(data, 'attempt-1', 'quiz-1', 'u1')?.id).toBe('attempt-1')
  })

  it('returns nothing when the attempt is at a different quiz', () => {
    expect(getAttemptFor(data, 'attempt-1', 'quiz-2', 'u1')).toBeUndefined()
  })

  it('returns nothing when the attempt belongs to someone else', () => {
    expect(getAttemptFor(data, 'attempt-1', 'quiz-1', 'u2')).toBeUndefined()
  })

  it('returns nothing when the attempt does not exist', () => {
    expect(getAttemptFor(data, 'missing', 'quiz-1', 'u1')).toBeUndefined()
  })
})
