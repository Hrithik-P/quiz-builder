import { describe, expect, it } from 'vitest'
import { buildResult, isAnswerCorrect, toPercentage } from '../../services/scoring'
import { makeAttempt, makeQuestion } from './builders'

describe('isAnswerCorrect', () => {
  const multiple = makeQuestion('m', {
    type: 'multiple',
    options: [
      { id: 'm-a', text: 'A' },
      { id: 'm-b', text: 'B' },
      { id: 'm-c', text: 'C' },
    ],
    correctOptionIds: ['m-a', 'm-c'],
  })

  it('accepts the exact correct set in any order', () => {
    expect(isAnswerCorrect(multiple, ['m-c', 'm-a'])).toBe(true)
  })

  it('gives no partial credit', () => {
    expect(isAnswerCorrect(multiple, ['m-a'])).toBe(false)
    expect(isAnswerCorrect(multiple, ['m-a', 'm-b', 'm-c'])).toBe(false)
  })

  it('treats an empty selection as wrong', () => {
    expect(isAnswerCorrect(makeQuestion('q1'), [])).toBe(false)
  })
})

describe('toPercentage', () => {
  it('rounds to one decimal place', () => {
    expect(toPercentage(5, 6)).toBe(83.3)
    expect(toPercentage(6, 7)).toBe(85.7)
  })

  it('returns 0 for an empty quiz', () => {
    expect(toPercentage(0, 0)).toBe(0)
  })
})

describe('buildResult', () => {
  it('returns undefined while the attempt is in progress', () => {
    expect(buildResult(makeAttempt())).toBeUndefined()
  })

  it('derives correct and incorrect counts from the stored score', () => {
    const attempt = makeAttempt({
      status: 'completed',
      score: 2,
      totalQuestions: 3,
      percentage: 66.7,
      timeTakenSeconds: 42,
      completedAt: '2026-10-01T10:00:42Z',
    })
    expect(buildResult(attempt)).toMatchObject({
      score: 2,
      correctCount: 2,
      incorrectCount: 1,
      percentage: 66.7,
      timeTakenSeconds: 42,
    })
  })
})
