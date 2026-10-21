import { describe, expect, it } from 'vitest'
import { appendAnswer } from '../../services/attempt'
import { getDeadlines, settleAttempt, SUBMIT_GRACE_MS } from '../../services/timing'
import { makeAttempt, makeQuestion, makeQuiz, secondsAfterStart, START_MS } from './builders'

const fiveQuestions = ['q1', 'q2', 'q3', 'q4', 'q5'].map((id) => makeQuestion(id))

describe('getDeadlines', () => {
  it('has no deadlines when the quiz has no limits', () => {
    expect(getDeadlines(makeAttempt(), makeQuiz())).toEqual({
      overallEndsAtMs: null,
      questionEndsAtMs: null,
    })
  })

  it('counts the overall limit from the attempt start', () => {
    const { overallEndsAtMs } = getDeadlines(makeAttempt(), makeQuiz({ timeLimitSeconds: 60 }))
    expect(overallEndsAtMs).toBe(secondsAfterStart(60))
  })

  it('counts the per-question limit from the previous answer', () => {
    const quiz = makeQuiz({ perQuestionSeconds: 30 })
    const answered = appendAnswer(makeAttempt(), quiz, ['q1-a'], secondsAfterStart(12))
    expect(getDeadlines(makeAttempt(), quiz).questionEndsAtMs).toBe(secondsAfterStart(30))
    expect(getDeadlines(answered, quiz).questionEndsAtMs).toBe(secondsAfterStart(42))
  })
})

describe('settleAttempt', () => {
  it('leaves an attempt without limits untouched', () => {
    const attempt = makeAttempt()
    expect(settleAttempt(attempt, makeQuiz(), secondsAfterStart(99999))).toBe(attempt)
  })

  it('leaves a completed attempt untouched', () => {
    const attempt = makeAttempt({ status: 'completed' })
    expect(settleAttempt(attempt, makeQuiz({ timeLimitSeconds: 1 }), secondsAfterStart(500))).toBe(
      attempt,
    )
  })

  describe('overall limit', () => {
    const quiz = makeQuiz({ timeLimitSeconds: 60 })

    it('keeps the attempt open before the deadline', () => {
      expect(settleAttempt(makeAttempt(), quiz, secondsAfterStart(30)).status).toBe('in_progress')
    })

    it('still accepts a submission inside the grace window', () => {
      const justAfter = secondsAfterStart(60) + SUBMIT_GRACE_MS
      expect(settleAttempt(makeAttempt(), quiz, justAfter).status).toBe('in_progress')
    })

    it('completes at the deadline, scoring what was answered', () => {
      const answered = appendAnswer(makeAttempt(), quiz, ['q1-a'], secondsAfterStart(10))
      const settled = settleAttempt(answered, quiz, secondsAfterStart(500))

      expect(settled).toMatchObject({
        status: 'completed',
        completedAt: new Date(secondsAfterStart(60)).toISOString(),
        score: 1,
        totalQuestions: 3,
        percentage: 33.3,
        timeTakenSeconds: 60,
      })
      expect(settled.answers).toHaveLength(3)
    })
  })

  describe('per-question limit', () => {
    const quiz = makeQuiz({ perQuestionSeconds: 30, questions: fiveQuestions })
    const attempt = makeAttempt({ totalQuestions: 5 })

    it('advances past every question that expired while the user was away', () => {
      const settled = settleAttempt(attempt, quiz, secondsAfterStart(95))

      expect(settled.status).toBe('in_progress')
      expect(settled.currentQuestionIndex).toBe(3)
      expect(settled.answers.map((answer) => answer.answeredAt)).toEqual([
        new Date(secondsAfterStart(30)).toISOString(),
        new Date(secondsAfterStart(60)).toISOString(),
        new Date(secondsAfterStart(90)).toISOString(),
      ])
      expect(settled.answers.every((answer) => !answer.isCorrect)).toBe(true)
    })

    it('completes once the last question expires', () => {
      const settled = settleAttempt(attempt, quiz, secondsAfterStart(1000))
      expect(settled).toMatchObject({ status: 'completed', score: 0, timeTakenSeconds: 150 })
    })
  })

  it('uses whichever limit expires first when both are set', () => {
    const quiz = makeQuiz({ timeLimitSeconds: 50, perQuestionSeconds: 30 })
    const settled = settleAttempt(makeAttempt(), quiz, secondsAfterStart(500))
    expect(settled).toMatchObject({ status: 'completed', timeTakenSeconds: 50 })
  })

  it('does not mutate the attempt it is given', () => {
    const attempt = makeAttempt()
    settleAttempt(attempt, makeQuiz({ timeLimitSeconds: 1 }), START_MS + 100_000)
    expect(attempt.status).toBe('in_progress')
    expect(attempt.answers).toHaveLength(0)
  })
})
