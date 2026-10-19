export type CountryCode = string

export interface Country {
  code: CountryCode
  name: string
}

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  country: CountryCode
  role: UserRole
}

export type QuestionType = 'single' | 'multiple'

export interface Option {
  id: string
  text: string
  imageUrl?: string
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  options: Option[]
  correctOptionIds: string[]
}

export interface Quiz {
  id: string
  title: string
  description: string
  countries: CountryCode[]
  /** Overall limit for the whole attempt; null means no overall limit. */
  timeLimitSeconds: number | null
  /** Limit per question; null means no per-question limit. */
  perQuestionSeconds: number | null
  retakesAllowed: boolean
  questions: Question[]
}

export type AttemptStatus = 'in_progress' | 'completed'

export interface Answer {
  questionId: string
  selectedOptionIds: string[]
  isCorrect: boolean
  answeredAt: string
}

export interface Attempt {
  id: string
  quizId: string
  userId: string
  status: AttemptStatus
  startedAt: string
  currentQuestionIndex: number
  answers: Answer[]
  completedAt: string | null
  score: number | null
  totalQuestions: number
  percentage: number | null
  timeTakenSeconds: number | null
}

export interface Database {
  meta: { version: number; generatedAt: string; notes?: string }
  countries: Country[]
  users: User[]
  quizzes: Quiz[]
  attempts: Attempt[]
}
