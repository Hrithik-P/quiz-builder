import { z } from 'zod'
import type { QuizData } from '../types/models'

/**
 * The shape of the data saved in localStorage, checked record by record. It checks types, not the
 * admin form's rules: anything that passes can be rendered without crashing. Timestamps must parse,
 * or deadlines become NaN; counts must be whole and not negative, because they size arrays.
 */

const timestampSchema = z.iso.datetime({ offset: true })
const countSchema = z.number().int().nonnegative()

const storedCountrySchema = z.object({ code: z.string(), name: z.string() })

const storedUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  role: z.enum(['user', 'admin']),
})

const storedOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  imageUrl: z.string().optional(),
})

const storedQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['single', 'multiple']),
  options: z.array(storedOptionSchema),
  correctOptionIds: z.array(z.string()),
})

const storedQuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  countries: z.array(z.string()),
  timeLimitSeconds: z.number().positive().nullable(),
  perQuestionSeconds: z.number().positive().nullable(),
  retakesAllowed: z.boolean(),
  questions: z.array(storedQuestionSchema),
  revision: countSchema.optional(),
})

const storedAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionIds: z.array(z.string()),
  isCorrect: z.boolean(),
  answeredAt: timestampSchema,
})

const storedAttemptSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  userId: z.string(),
  status: z.enum(['in_progress', 'completed']),
  startedAt: timestampSchema,
  currentQuestionIndex: countSchema,
  answers: z.array(storedAnswerSchema),
  completedAt: timestampSchema.nullable(),
  score: countSchema.nullable(),
  totalQuestions: countSchema,
  percentage: z.number().nullable(),
  timeTakenSeconds: z.number().nonnegative().nullable(),
  quizRevision: countSchema.optional(),
})

export const quizDataSchema = z.object({
  countries: z.array(storedCountrySchema),
  users: z.array(storedUserSchema),
  quizzes: z.array(storedQuizSchema),
  attempts: z.array(storedAttemptSchema),
}) satisfies z.ZodType<QuizData>
