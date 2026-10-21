import type { Attempt, Question, Quiz } from '../../types/models'

export const START_MS = Date.parse('2026-10-01T10:00:00Z')

export function secondsAfterStart(seconds: number): number {
  return START_MS + seconds * 1000
}

/** A single-choice question whose correct option is `<id>-a`. */
export function makeQuestion(id: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    text: `Question ${id}`,
    type: 'single',
    options: [
      { id: `${id}-a`, text: 'A' },
      { id: `${id}-b`, text: 'B' },
    ],
    correctOptionIds: [`${id}-a`],
    ...overrides,
  }
}

export function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: 'quiz-1',
    title: 'Test quiz',
    description: 'A quiz for tests',
    countries: ['IN'],
    timeLimitSeconds: null,
    perQuestionSeconds: null,
    retakesAllowed: true,
    questions: [makeQuestion('q1'), makeQuestion('q2'), makeQuestion('q3')],
    ...overrides,
  }
}

export function makeAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'u1',
    status: 'in_progress',
    startedAt: new Date(START_MS).toISOString(),
    currentQuestionIndex: 0,
    answers: [],
    completedAt: null,
    score: null,
    totalQuestions: 3,
    percentage: null,
    timeTakenSeconds: null,
    ...overrides,
  }
}
