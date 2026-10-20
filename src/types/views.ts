import type { Question, Quiz } from './models'

/** A quiz as shown in lists: no questions, plus the current user's progress. */
export type QuizSummary = Omit<Quiz, 'questions'> & {
  questionCount: number
  completed: boolean
  bestScore: number | null
  bestPercentage: number | null
}

/** A question as the attend screen may see it: never includes the correct answers. */
export type PublicQuestion = Omit<Question, 'correctOptionIds'>

export interface AttemptResult {
  attemptId: string
  quizId: string
  userId: string
  score: number
  totalQuestions: number
  percentage: number
  correctCount: number
  incorrectCount: number
  timeTakenSeconds: number
  completedAt: string
}

export interface LeaderboardEntry {
  rank: number
  attemptId: string
  userId: string
  userName: string
  score: number
  totalQuestions: number
  percentage: number
  timeTakenSeconds: number
}
