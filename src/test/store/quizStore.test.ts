import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import seedJson from '../../data/seed.json'
import {
  getBestResult,
  getCurrentQuestion,
  getInProgressAttempt,
  getLeaderboard,
  getQuizInfo,
  getQuizzes,
  getResult,
} from '../../services/quizQueries'
import { QUIZ_STORAGE_KEY, useQuizStore } from '../../store/quizStore'
import type { Database, Quiz, QuizInput } from '../../types/models'

const seed = seedJson as Database

/** After the seed's in-progress attempt (a11) has run out of time. */
const AFTER_SEED_EXPIRY = '2026-10-21T10:00:00Z'

/** Always the latest state: actions replace it, so never hold on to an old snapshot. */
function store() {
  return useQuizStore.getState()
}

function setNow(iso: string) {
  vi.setSystemTime(new Date(iso))
}

function advanceSeconds(seconds: number) {
  vi.setSystemTime(Date.now() + seconds * 1000)
}

function getFullQuiz(quizId: string): Quiz {
  const quiz = store().quizzes.find((candidate) => candidate.id === quizId)
  if (!quiz) throw new Error(`Seed quiz ${quizId} is missing`)
  return quiz
}

function toInput(quiz: Quiz): QuizInput {
  return structuredClone({
    title: quiz.title,
    description: quiz.description,
    countries: quiz.countries,
    timeLimitSeconds: quiz.timeLimitSeconds,
    perQuestionSeconds: quiz.perQuestionSeconds,
    retakesAllowed: quiz.retakesAllowed,
    questions: quiz.questions,
  })
}

function startAttempt(quizId: string, userId: string) {
  const result = store().startOrResumeAttempt(quizId, userId)
  if (!result.ok) throw new Error(`Could not start: ${result.reason}`)
  return result.attempt
}

function currentQuestion(attemptId: string) {
  const state = getCurrentQuestion(store(), attemptId)
  if (state.status !== 'question') throw new Error(`Expected a question, got ${state.status}`)
  return state
}

/** Answers the current question correctly, using the admin view of the quiz. */
function answerCorrectly(quizId: string, attemptId: string) {
  const { index, question } = currentQuestion(attemptId)
  const correct = getFullQuiz(quizId).questions[index]?.correctOptionIds ?? []
  return store().submitAnswer(attemptId, question.id, correct)
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  setNow(AFTER_SEED_EXPIRY)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('seed data', () => {
  it('has a stored score that matches each completed attempt’s answers', () => {
    for (const attempt of seed.attempts.filter((candidate) => candidate.status === 'completed')) {
      const correctCount = attempt.answers.filter((answer) => answer.isCorrect).length
      expect(attempt.score, attempt.id).toBe(correctCount)
    }
  })

  it('is what the store starts with', () => {
    expect(store().users).toHaveLength(5)
    expect(store().quizzes).toHaveLength(5)
    expect(store().attempts).toHaveLength(11)
  })
})

describe('getQuizzes', () => {
  it('returns every quiz when no country is given', () => {
    expect(getQuizzes(store(), 'u1')).toHaveLength(5)
  })

  it('filters by assigned country', () => {
    const ids = (country: string) => getQuizzes(store(), 'u1', country).map((quiz) => quiz.id)
    expect(ids('AE')).toEqual(['q1', 'q3', 'q5'])
    expect(ids('IN')).toEqual(['q1', 'q2', 'q3', 'q4'])
  })

  it('marks completed quizzes with the user’s best score', () => {
    const byId = new Map(getQuizzes(store(), 'u1').map((quiz) => [quiz.id, quiz]))
    expect(byId.get('q1')).toMatchObject({ completed: true, bestScore: 5, bestPercentage: 83.3 })
    expect(byId.get('q2')).toMatchObject({ completed: true, bestScore: 6 })
    expect(byId.get('q4')).toMatchObject({ completed: false, bestScore: null })
  })

  it('only counts the requested user’s attempts', () => {
    const q1 = getQuizzes(store(), 'u2').find((quiz) => quiz.id === 'q1')
    expect(q1).toMatchObject({ completed: true, bestScore: 6 })
  })
})

describe('getQuizInfo', () => {
  it('returns quiz details without questions or answers', () => {
    const quiz = getQuizInfo(store(), 'q2')
    expect(quiz).toMatchObject({
      title: 'React Fundamentals',
      perQuestionSeconds: 30,
      retakesAllowed: false,
      questionCount: 7,
    })
    expect(JSON.stringify(quiz)).not.toContain('correctOptionIds')
  })
})

describe('getLeaderboard', () => {
  it('ranks by score and breaks ties with the faster time', () => {
    const entries = getLeaderboard(store(), 'q1')
    expect(entries.map((entry) => [entry.rank, entry.userId, entry.score])).toEqual([
      [1, 'u2', 6],
      [2, 'u4', 5],
      [3, 'u1', 5],
      [4, 'u3', 4],
    ])
  })

  it('limits the list when asked', () => {
    expect(getLeaderboard(store(), 'q1', 2)).toHaveLength(2)
  })
})

describe('seed attempt that has run out of time', () => {
  it('can still be resumed with the right remaining time inside its limit', () => {
    setNow('2026-10-16T09:01:00Z')
    const state = currentQuestion('a11')
    expect(state).toMatchObject({ index: 2, total: 5 })
    // Started 09:00:00 with a 240 s limit, so the quiz ends at 09:04:00.
    expect(state.timers.overall).toEqual({ endsAt: '2026-10-16T09:04:00.000Z', totalSeconds: 240 })
  })

  it('is completed when it is resumed after its time limit', () => {
    const resumed = startAttempt('q3', 'u1')

    expect(resumed).toMatchObject({ id: 'a11', status: 'completed' })
    expect(getCurrentQuestion(store(), 'a11')).toEqual({
      status: 'completed',
      attemptId: 'a11',
    })
    expect(getResult(store(), 'a11')).toMatchObject({ totalQuestions: 5, timeTakenSeconds: 240 })
  })

  it('stays in progress until something opens it', () => {
    expect(getInProgressAttempt(store(), 'q3', 'u1')?.id).toBe('a11')
  })
})

describe('startOrResumeAttempt', () => {
  it('starts an attempt on the current revision', () => {
    const attempt = startAttempt('q1', 'u5')
    expect(attempt).toMatchObject({
      status: 'in_progress',
      startedAt: new Date(AFTER_SEED_EXPIRY).toISOString(),
      quizRevision: 0,
    })
  })

  it('resumes the same attempt instead of starting another', () => {
    const first = startAttempt('q1', 'u5')
    advanceSeconds(30)
    expect(startAttempt('q1', 'u5').id).toBe(first.id)
  })

  it('blocks a retake when the quiz does not allow it', () => {
    expect(store().startOrResumeAttempt('q2', 'u1')).toEqual({
      ok: false,
      reason: 'retake_not_allowed',
    })
  })

  it('allows a retake when the quiz does', () => {
    expect(startAttempt('q1', 'u1').status).toBe('in_progress')
  })

  it('reports unknown quizzes and users', () => {
    expect(store().startOrResumeAttempt('missing', 'u1')).toEqual({
      ok: false,
      reason: 'not_found',
    })
    expect(store().startOrResumeAttempt('q1', 'missing')).toEqual({
      ok: false,
      reason: 'not_found',
    })
  })
})

describe('taking a quiz', () => {
  it('never exposes correct answers to the UI', () => {
    const attempt = startAttempt('q1', 'u5')
    expect(JSON.stringify(currentQuestion(attempt.id))).not.toContain('correctOptionIds')
  })

  it('scores a full run and updates the list and leaderboard', () => {
    const attempt = startAttempt('q4', 'u1')
    for (let index = 0; index < 5; index += 1) {
      advanceSeconds(10)
      answerCorrectly('q4', attempt.id)
    }

    expect(getCurrentQuestion(store(), attempt.id)).toEqual({
      status: 'completed',
      attemptId: attempt.id,
    })
    expect(store().completeAttempt(attempt.id)).toMatchObject({
      score: 5,
      percentage: 100,
      correctCount: 5,
      incorrectCount: 0,
      timeTakenSeconds: 50,
    })
    expect(getQuizzes(store(), 'u1').find((quiz) => quiz.id === 'q4')).toMatchObject({
      completed: true,
      bestScore: 5,
    })
    expect(getLeaderboard(store(), 'q4').map((entry) => entry.userId)).toEqual(['u1', 'u4'])
  })

  it('ignores a repeated submission for the same question', () => {
    const attempt = startAttempt('q1', 'u5')
    const { question } = currentQuestion(attempt.id)
    const optionId = question.options[0]?.id ?? ''

    store().submitAnswer(attempt.id, question.id, [optionId])
    const repeated = store().submitAnswer(attempt.id, question.id, [optionId])

    expect(store().attempts.find((stored) => stored.id === attempt.id)?.answers).toHaveLength(1)
    expect(repeated).toMatchObject({ status: 'question', index: 1 })
  })

  it('rejects options that do not belong to the question, and several for single choice', () => {
    const attempt = startAttempt('q1', 'u5')
    const { question } = currentQuestion(attempt.id)
    const [first, second] = question.options

    expect(() => store().submitAnswer(attempt.id, question.id, ['nope'])).toThrow()
    expect(() =>
      store().submitAnswer(attempt.id, question.id, [first?.id ?? '', second?.id ?? '']),
    ).toThrow()
  })

  it('completes with the overall limit when time runs out', () => {
    const attempt = startAttempt('q4', 'u1')
    advanceSeconds(10)
    answerCorrectly('q4', attempt.id)
    advanceSeconds(1000)

    expect(store().completeAttempt(attempt.id)).toMatchObject({
      score: 1,
      incorrectCount: 4,
      timeTakenSeconds: 180,
    })
  })

  it('returns nothing for an attempt that does not exist', () => {
    expect(store().completeAttempt('missing')).toBeUndefined()
    expect(getCurrentQuestion(store(), 'missing')).toEqual({ status: 'not_found' })
  })
})

describe('per-question time limit (q2, 30 seconds each)', () => {
  it('counts a selection submitted at the buzzer, inside the grace window', () => {
    const attempt = startAttempt('q2', 'u2')
    advanceSeconds(31)
    answerCorrectly('q2', attempt.id)

    const [first] = store().attempts.find((stored) => stored.id === attempt.id)?.answers ?? []
    expect(first?.isCorrect).toBe(true)
    expect(first?.answeredAt).toBe(new Date(Date.parse(AFTER_SEED_EXPIRY) + 30_000).toISOString())
    expect(currentQuestion(attempt.id).index).toBe(1)
  })

  it('records an empty answer and moves on once the grace window has passed', () => {
    const attempt = startAttempt('q2', 'u2')
    advanceSeconds(35)

    const late = store().submitAnswer(attempt.id, 'q2-1', ['q2-1-o1'])

    expect(late).toMatchObject({ status: 'question', index: 1 })
    const [first] = store().attempts.find((stored) => stored.id === attempt.id)?.answers ?? []
    expect(first?.selectedOptionIds).toEqual([])
  })

  it('advances past every question that expired while the user was away', () => {
    const attempt = startAttempt('q2', 'u2')
    advanceSeconds(100)
    store().refreshAttempt(attempt.id)

    const state = currentQuestion(attempt.id)
    expect(state.index).toBe(3)
    // Question 3 started at the 90 s mark and gets 30 s, so it ends 20 s from now.
    expect(Date.parse(state.timers.question?.endsAt ?? '') - Date.now()).toBe(20_000)
  })
})

describe('quiz changed during an attempt', () => {
  it('reports an edit, and lets the user start again', () => {
    const attempt = startAttempt('q1', 'u5')
    store().updateQuiz('q1', toInput(getFullQuiz('q1')))

    expect(getCurrentQuestion(store(), attempt.id)).toEqual({
      status: 'quiz_unavailable',
      reason: 'edited',
    })
    expect(getInProgressAttempt(store(), 'q1', 'u5')).toBeUndefined()
    expect(startAttempt('q1', 'u5').id).not.toBe(attempt.id)
  })

  it('reports a deleted quiz', () => {
    const attempt = startAttempt('q1', 'u5')
    store().deleteQuiz('q1')

    expect(getCurrentQuestion(store(), attempt.id)).toEqual({
      status: 'quiz_unavailable',
      reason: 'deleted',
    })
  })
})

describe('admin changes', () => {
  it('creates a quiz with the assigned countries', () => {
    const created = store().createQuiz({ ...toInput(getFullQuiz('q1')), countries: ['GB'] })

    expect(created).toMatchObject({ revision: 0, countries: ['GB'] })
    expect(getQuizzes(store(), 'u1', 'GB').map((quiz) => quiz.id)).toContain(created.id)
  })

  it('updates a quiz and bumps its revision', () => {
    store().updateQuiz('q1', { ...toInput(getFullQuiz('q1')), title: 'New' })
    expect(getFullQuiz('q1')).toMatchObject({ title: 'New', revision: 1 })
  })

  it('deletes a quiz', () => {
    store().deleteQuiz('q1')
    expect(store().quizzes.map((quiz) => quiz.id)).not.toContain('q1')
  })

  it('restores the seed on reset', () => {
    store().deleteQuiz('q1')
    store().createQuiz(toInput(getFullQuiz('q2')))
    store().resetData()

    expect(store().quizzes).toHaveLength(5)
    expect(store().attempts.find((attempt) => attempt.id === 'a11')?.status).toBe('in_progress')
  })
})

describe('persistence', () => {
  function savedState(): Record<string, unknown> {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY)
    return (JSON.parse(raw ?? '{}') as { state?: Record<string, unknown> }).state ?? {}
  }

  it('saves changes to localStorage, data only', () => {
    store().deleteQuiz('q1')

    const saved = savedState()
    expect(Object.keys(saved).sort()).toEqual(['attempts', 'countries', 'quizzes', 'users'])
    expect((saved.quizzes as Quiz[]).map((quiz) => quiz.id)).not.toContain('q1')
  })

  it('restores saved data after a reload', async () => {
    store().deleteQuiz('q1')
    const saved = localStorage.getItem(QUIZ_STORAGE_KEY) ?? ''

    // Simulate a reload: the in-memory state is lost, localStorage is read again.
    useQuizStore.setState({ quizzes: seed.quizzes })
    localStorage.setItem(QUIZ_STORAGE_KEY, saved)
    await useQuizStore.persist.rehydrate()

    expect(store().quizzes.map((quiz) => quiz.id)).not.toContain('q1')
  })

  it('keeps answers across a reload so an attempt can be resumed', async () => {
    const attempt = startAttempt('q1', 'u5')
    answerCorrectly('q1', attempt.id)
    const saved = localStorage.getItem(QUIZ_STORAGE_KEY) ?? ''

    store().resetData()
    localStorage.setItem(QUIZ_STORAGE_KEY, saved)
    await useQuizStore.persist.rehydrate()

    expect(currentQuestion(attempt.id).index).toBe(1)
    expect(getBestResult(store(), 'q1', 'u5')).toBeUndefined()
  })
})
