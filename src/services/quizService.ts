import type { Attempt, Country, Question, Quiz, User } from '../types/models'
import type { AttemptResult, LeaderboardEntry, PublicQuestion, QuizSummary } from '../types/views'

/**
 * Data service: the only code allowed to touch browser storage.
 *
 * Every function is a typed stub that returns "no data", so the UI renders its empty states.
 * TODO: seed localStorage from src/data/seed.json on first load, persist every change, add
 * a "Reset data" action, and compute scoring and timing here from stored timestamps.
 */
export const quizService = {
  getUsers(): User[] {
    return []
  },

  getUser(_userId: string): User | undefined {
    return undefined
  },

  getCountries(): Country[] {
    return []
  },

  /** Admin list and leaderboard picker: every quiz, unfiltered. */
  getAllQuizzes(): Quiz[] {
    return []
  },

  getQuiz(_quizId: string): Quiz | undefined {
    return undefined
  },

  /** Quizzes for a country (all when omitted), with the user's completion and best score. */
  getQuizzes(_userId: string, _country?: string): QuizSummary[] {
    return []
  },

  getQuizSummary(_quizId: string, _userId: string): QuizSummary | undefined {
    return undefined
  },

  getAttempt(_attemptId: string): Attempt | undefined {
    return undefined
  },

  getInProgressAttempt(_quizId: string, _userId: string): Attempt | undefined {
    return undefined
  },

  getBestResult(_quizId: string, _userId: string): AttemptResult | undefined {
    return undefined
  },

  getResult(_attemptId: string): AttemptResult | undefined {
    return undefined
  },

  /** Each user's best attempt, ranked by score, ties broken by faster time. */
  getLeaderboard(_quizId: string): LeaderboardEntry[] {
    return []
  },

  /** Strips the correct answers so the attend screen can never see them. */
  toPublicQuestion(question: Question): PublicQuestion {
    return { id: question.id, text: question.text, type: question.type, options: question.options }
  },
}
