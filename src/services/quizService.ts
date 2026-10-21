import type { Attempt, Country, Question, Quiz, User } from '../types/models'
import type { AttemptResult, LeaderboardEntry, PublicQuestion, QuizSummary } from '../types/views'

/** The only code that touches stored data. TODO: replace these stubs with the real service. */
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

  getAllQuizzes(): Quiz[] {
    return []
  },

  getQuiz(_quizId: string): Quiz | undefined {
    return undefined
  },

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

  /** Best attempt per user, ranked by score, then faster time. */
  getLeaderboard(_quizId: string): LeaderboardEntry[] {
    return []
  },

  /** Strips the correct answers. */
  toPublicQuestion(question: Question): PublicQuestion {
    return { id: question.id, text: question.text, type: question.type, options: question.options }
  },
}
