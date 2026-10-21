import { describe, expect, it } from 'vitest'
import { recordAnswer } from '../../services/answering'
import { SUBMIT_GRACE_MS } from '../../services/timing'
import { makeAttempt, makeQuestion, makeQuiz, secondsAfterStart } from './builders'

describe('recordAnswer', () => {
  it('records the answer at the current time and moves to the next question', () => {
    const attempt = makeAttempt()
    const recorded = recordAnswer(attempt, makeQuiz(), 'q1', ['q1-a'], secondsAfterStart(12))

    expect(recorded.answers).toEqual([
      {
        questionId: 'q1',
        selectedOptionIds: ['q1-a'],
        isCorrect: true,
        answeredAt: new Date(secondsAfterStart(12)).toISOString(),
      },
    ])
    expect(recorded).toMatchObject({ status: 'in_progress', currentQuestionIndex: 1 })
    expect(attempt.answers).toEqual([])
  })

  it('completes the attempt with its score after the last question', () => {
    const quiz = makeQuiz({ questions: [makeQuestion('q1'), makeQuestion('q2')] })
    const first = recordAnswer(makeAttempt(), quiz, 'q1', ['q1-a'], secondsAfterStart(10))
    const done = recordAnswer(first, quiz, 'q2', ['q2-b'], secondsAfterStart(25))

    expect(done).toMatchObject({
      status: 'completed',
      score: 1,
      totalQuestions: 2,
      percentage: 50,
      timeTakenSeconds: 25,
    })
  })

  it('changes nothing for a question that is no longer current, such as a double click', () => {
    const quiz = makeQuiz()
    const answered = recordAnswer(makeAttempt(), quiz, 'q1', ['q1-a'], secondsAfterStart(5))

    expect(recordAnswer(answered, quiz, 'q1', ['q1-b'], secondsAfterStart(6))).toBe(answered)
  })

  it('leaves completed attempts and attempts on an edited quiz untouched', () => {
    const completed = makeAttempt({ status: 'completed' })
    const stale = makeAttempt({ quizRevision: 0 })
    const editedQuiz = makeQuiz({ revision: 1 })

    expect(recordAnswer(completed, makeQuiz(), 'q1', ['q1-a'], secondsAfterStart(5))).toBe(
      completed,
    )
    expect(recordAnswer(stale, editedQuiz, 'q1', ['q1-a'], secondsAfterStart(5))).toBe(stale)
  })

  it('rejects options that do not belong to the question, and several for single choice', () => {
    const quiz = makeQuiz()
    const nowMs = secondsAfterStart(5)

    expect(() => recordAnswer(makeAttempt(), quiz, 'q1', ['q2-a'], nowMs)).toThrow()
    expect(() => recordAnswer(makeAttempt(), quiz, 'q1', ['q1-a', 'q1-b'], nowMs)).toThrow()
  })

  describe('per-question limit (30 seconds)', () => {
    const quiz = makeQuiz({ perQuestionSeconds: 30 })

    it('stamps a submission inside the grace window at the deadline', () => {
      const nowMs = secondsAfterStart(30) + SUBMIT_GRACE_MS - 1
      const recorded = recordAnswer(makeAttempt(), quiz, 'q1', ['q1-a'], nowMs)

      expect(recorded.answers[0]).toMatchObject({
        selectedOptionIds: ['q1-a'],
        answeredAt: new Date(secondsAfterStart(30)).toISOString(),
      })
    })

    it('records the expired question as unanswered and ignores the late submission', () => {
      const nowMs = secondsAfterStart(30) + SUBMIT_GRACE_MS + 1
      const recorded = recordAnswer(makeAttempt(), quiz, 'q1', ['q1-a'], nowMs)

      expect(recorded.answers).toHaveLength(1)
      expect(recorded.answers[0]).toMatchObject({ questionId: 'q1', selectedOptionIds: [] })
    })
  })

  describe('overall limit (60 seconds)', () => {
    const quiz = makeQuiz({ timeLimitSeconds: 60 })

    it('records a submission inside the grace window, then completes at the deadline', () => {
      const nowMs = secondsAfterStart(60) + SUBMIT_GRACE_MS - 1
      const recorded = recordAnswer(makeAttempt(), quiz, 'q1', ['q1-a'], nowMs)

      expect(recorded).toMatchObject({ status: 'completed', score: 1, timeTakenSeconds: 60 })
    })

    it('completes without the late answer once the grace window has passed', () => {
      const nowMs = secondsAfterStart(60) + SUBMIT_GRACE_MS + 1
      const recorded = recordAnswer(makeAttempt(), quiz, 'q1', ['q1-a'], nowMs)

      expect(recorded).toMatchObject({ status: 'completed', score: 0, timeTakenSeconds: 60 })
    })
  })
})
