import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import seedJson from '../data/seed.json'
import { appendAnswer, finalizeAttempt } from '../services/attempt'
import { getCurrentQuestion, isQuizEdited } from '../services/quizQueries'
import { buildResult } from '../services/scoring'
import { getDeadlines, settleAttempt } from '../services/timing'
import type { Attempt, Database, Question, Quiz, QuizData, QuizInput } from '../types/models'
import type { AttemptResult, AttemptState } from '../types/views'

/** Bump the suffix if the stored shape changes. */
export const QUIZ_STORAGE_KEY = 'quiz-platform:db:v1'

const seed = seedJson as Database

function createSeedData(): QuizData {
  return structuredClone({
    countries: seed.countries,
    users: seed.users,
    quizzes: seed.quizzes,
    attempts: seed.attempts,
  })
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function assertValidSelection(question: Question, optionIds: string[]): void {
  const knownOptionIds = new Set(question.options.map((option) => option.id))
  const isKnown = optionIds.every((optionId) => knownOptionIds.has(optionId))
  const hasTooMany = question.type === 'single' && optionIds.length > 1
  // An empty selection is valid: it is what a timeout submits when nothing was chosen.
  if (!isKnown || hasTooMany)
    throw new Error('The selected options are not valid for this question.')
}

export type StartAttemptResult =
  { ok: true; attempt: Attempt } | { ok: false; reason: 'not_found' | 'retake_not_allowed' }

interface QuizActions {
  createQuiz: (input: QuizInput) => Quiz
  updateQuiz: (quizId: string, input: QuizInput) => void
  /** Attempts are kept, so an in-progress attempt can say its quiz was deleted. */
  deleteQuiz: (quizId: string) => void
  /** Resumes the user's in-progress attempt, or starts a new one when retakes allow it. */
  startOrResumeAttempt: (quizId: string, userId: string) => StartAttemptResult
  /** Applies deadlines that have passed: expired questions are left unanswered, the quiz may end. */
  refreshAttempt: (attemptId: string) => void
  /**
   * Records the answer for the current question and returns what to show next. A submission for a
   * question that is no longer current (a double click, a stale tab) changes nothing.
   */
  submitAnswer: (attemptId: string, questionId: string, optionIds: string[]) => AttemptState
  /** Idempotent: a completed attempt returns its stored result. */
  completeAttempt: (attemptId: string) => AttemptResult | undefined
  /** Restores the seed data. */
  resetData: () => void
}

export type QuizStore = QuizData & QuizActions

/**
 * All app data, kept in memory and saved to localStorage by the `persist` middleware. On the first
 * load there is nothing saved yet, so the seed is used. This is the only code that touches storage.
 */
export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => {
      function replaceAttempt(updated: Attempt) {
        set((state) => ({
          attempts: state.attempts.map((attempt) =>
            attempt.id === updated.id ? updated : attempt,
          ),
        }))
      }

      function findAttemptWithQuiz(attemptId: string) {
        const { attempts, quizzes } = get()
        const attempt = attempts.find((candidate) => candidate.id === attemptId)
        const quiz = quizzes.find((candidate) => candidate.id === attempt?.quizId)
        return { attempt, quiz }
      }

      return {
        ...createSeedData(),

        createQuiz: (input) => {
          const quiz: Quiz = { ...structuredClone(input), id: newId('quiz'), revision: 0 }
          set((state) => ({ quizzes: [...state.quizzes, quiz] }))
          return quiz
        },

        updateQuiz: (quizId, input) => {
          set((state) => ({
            quizzes: state.quizzes.map((quiz) =>
              quiz.id === quizId
                ? { ...structuredClone(input), id: quizId, revision: (quiz.revision ?? 0) + 1 }
                : quiz,
            ),
          }))
        },

        deleteQuiz: (quizId) => {
          set((state) => ({ quizzes: state.quizzes.filter((quiz) => quiz.id !== quizId) }))
        },

        startOrResumeAttempt: (quizId, userId) => {
          const { quizzes, users, attempts } = get()
          const quiz = quizzes.find((candidate) => candidate.id === quizId)
          if (!quiz || !users.some((user) => user.id === userId)) {
            return { ok: false, reason: 'not_found' }
          }

          const userAttempts = attempts.filter(
            (attempt) => attempt.quizId === quizId && attempt.userId === userId,
          )
          const inProgress = userAttempts.find((attempt) => attempt.status === 'in_progress')
          if (inProgress && !isQuizEdited(inProgress, quiz)) {
            get().refreshAttempt(inProgress.id)
            const resumed = get().attempts.find((attempt) => attempt.id === inProgress.id)
            return resumed ? { ok: true, attempt: resumed } : { ok: false, reason: 'not_found' }
          }

          const hasCompleted = userAttempts.some((attempt) => attempt.status === 'completed')
          if (hasCompleted && !quiz.retakesAllowed)
            return { ok: false, reason: 'retake_not_allowed' }

          const attempt: Attempt = {
            id: newId('attempt'),
            quizId,
            userId,
            status: 'in_progress',
            startedAt: new Date().toISOString(),
            currentQuestionIndex: 0,
            answers: [],
            completedAt: null,
            score: null,
            totalQuestions: quiz.questions.length,
            percentage: null,
            timeTakenSeconds: null,
            quizRevision: quiz.revision ?? 0,
          }
          // An attempt left over from before the quiz was edited is replaced by the fresh one.
          set((state) => ({
            attempts: [...state.attempts.filter((existing) => existing !== inProgress), attempt],
          }))
          return { ok: true, attempt }
        },

        refreshAttempt: (attemptId) => {
          const { attempt, quiz } = findAttemptWithQuiz(attemptId)
          if (
            !attempt ||
            !quiz ||
            attempt.status !== 'in_progress' ||
            isQuizEdited(attempt, quiz)
          ) {
            return
          }
          const settled = settleAttempt(attempt, quiz, Date.now())
          if (settled !== attempt) replaceAttempt(settled)
        },

        submitAnswer: (attemptId, questionId, optionIds) => {
          get().refreshAttempt(attemptId)
          const nowMs = Date.now()
          const { attempt, quiz } = findAttemptWithQuiz(attemptId)
          const current = getCurrentQuestion(get(), attemptId)
          if (current.status !== 'question' || !attempt || !quiz) return current

          const question = quiz.questions[attempt.answers.length]
          if (!question || question.id !== questionId) return current
          assertValidSelection(question, optionIds)

          // A submission accepted in the grace window counts as made at the deadline.
          const { overallEndsAtMs, questionEndsAtMs } = getDeadlines(attempt, quiz)
          const answeredAtMs = Math.min(nowMs, overallEndsAtMs ?? nowMs, questionEndsAtMs ?? nowMs)

          let updated = appendAnswer(attempt, quiz, optionIds, answeredAtMs)
          const isOutOfTime = overallEndsAtMs !== null && nowMs >= overallEndsAtMs
          if (updated.answers.length >= quiz.questions.length || isOutOfTime) {
            updated = finalizeAttempt(updated, quiz, answeredAtMs)
          }
          replaceAttempt(updated)
          return getCurrentQuestion(get(), attemptId)
        },

        completeAttempt: (attemptId) => {
          get().refreshAttempt(attemptId)
          const { attempt, quiz } = findAttemptWithQuiz(attemptId)
          if (!attempt) return undefined
          if (attempt.status === 'completed' || !quiz) return buildResult(attempt)

          const nowMs = Date.now()
          const { overallEndsAtMs } = getDeadlines(attempt, quiz)
          const finalized = finalizeAttempt(
            attempt,
            quiz,
            Math.min(nowMs, overallEndsAtMs ?? nowMs),
          )
          replaceAttempt(finalized)
          return buildResult(finalized)
        },

        resetData: () => set(createSeedData()),
      }
    },
    {
      name: QUIZ_STORAGE_KEY,
      version: 1,
      // Only the data is saved, never the actions.
      partialize: ({ countries, users, quizzes, attempts }): QuizData => ({
        countries,
        users,
        quizzes,
        attempts,
      }),
    },
  ),
)

/** The stored data for rendering. Re-renders the caller whenever any of it changes. */
export function useQuizData(): QuizData {
  return useQuizStore(
    useShallow(({ countries, users, quizzes, attempts }) => ({
      countries,
      users,
      quizzes,
      attempts,
    })),
  )
}
