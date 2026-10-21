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

/** What a quiz looks like outside the admin screens: no questions and no answers. */
export type QuizInfo = Omit<Quiz, 'questions' | 'revision'> & { questionCount: number }

export interface TimerInfo {
  /** ISO timestamp. The UI derives the live countdown from this, not from a counter. */
  endsAt: string
  totalSeconds: number
  remainingSeconds: number
}

export type AttemptState =
  | {
      status: 'question'
      attemptId: string
      question: PublicQuestion
      /** Zero-based. */
      index: number
      total: number
      timers: { overall: TimerInfo | null; question: TimerInfo | null }
    }
  | { status: 'completed'; attemptId: string }
  | { status: 'quiz_unavailable'; reason: 'edited' | 'deleted' }
  | { status: 'not_found' }

export type QuestionState = Extract<AttemptState, { status: 'question' }>
