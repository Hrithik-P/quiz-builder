import type { Question, Quiz } from './models'

export type QuizSummary = Omit<Quiz, 'questions'> & {
  questionCount: number
  completed: boolean
  bestScore: number | null
  bestPercentage: number | null
}

/** Never includes the correct answers. */
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
