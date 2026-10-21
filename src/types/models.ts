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
  /** null = no overall limit. */
  timeLimitSeconds: number | null
  /** null = no per-question limit. */
  perQuestionSeconds: number | null
  retakesAllowed: boolean
  questions: Question[]
  /** Bumped on every save so an in-progress attempt can tell its quiz changed. Missing = 0. */
  revision?: number
}

/** What the admin form submits: a quiz without the fields the store owns. */
export type QuizInput = Omit<Quiz, 'id' | 'revision'>

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
  /** The quiz revision the attempt started on. Missing = 0. */
  quizRevision?: number
}

/** Everything the app stores. The seed file has the same shape plus a `meta` block. */
export interface QuizData {
  countries: Country[]
  users: User[]
  quizzes: Quiz[]
  attempts: Attempt[]
}

export interface Database extends QuizData {
  meta: { version: number; generatedAt: string; notes?: string }
}
