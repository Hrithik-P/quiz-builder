import { z } from 'zod'
import type { QuizDraft } from './quizDraft'

const POSITIVE = 'Enter a time above zero, or leave it empty.'

const optionSchema = z.object({
  id: z.string(),
  text: z.string().trim().min(1, 'Enter the option text.'),
  imageUrl: z.string().optional(),
})

const questionSchema = z
  .object({
    id: z.string(),
    text: z.string().trim().min(1, 'Question text is required.'),
    type: z.enum(['single', 'multiple']),
    options: z.array(optionSchema).min(2, 'Add at least two options.'),
    correctOptionIds: z.array(z.string()),
  })
  .superRefine((question, ctx) => {
    const optionIds = new Set(question.options.map((o) => o.id))
    const correct = question.correctOptionIds.filter((id) => optionIds.has(id))
    const path = ['correctOptionIds']
    if (correct.length === 0) {
      ctx.addIssue({ code: 'custom', path, message: 'Mark at least one correct option.' })
    } else if (question.type === 'single' && correct.length !== 1) {
      ctx.addIssue({
        code: 'custom',
        path,
        message: 'Single-choice questions need exactly one correct option.',
      })
    }
  })

export const quizSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim(),
  countries: z.array(z.string()).min(1, 'Assign at least one country.'),
  timeLimitSeconds: z.number().positive(POSITIVE).nullable(),
  perQuestionSeconds: z.number().int('Use whole seconds.').positive(POSITIVE).nullable(),
  retakesAllowed: z.boolean(),
  questions: z.array(questionSchema).min(1, 'Add at least one question.'),
}) satisfies z.ZodType<QuizDraft, QuizDraft>
