import type { Option, Question, Quiz } from '../../types/models'

/** What the Add/Edit form edits: a quiz without its id. */
export type QuizDraft = Omit<Quiz, 'id'>

export interface QuestionErrors {
  text?: string
  options?: string
  correct?: string
}

export interface QuizFormErrors {
  title?: string
  questions?: string
  timeLimit?: string
  byQuestion: Record<string, QuestionErrors>
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function createOption(): Option {
  return { id: newId('opt'), text: '' }
}

export function createQuestion(): Question {
  return {
    id: newId('question'),
    text: '',
    type: 'single',
    options: [createOption(), createOption()],
    correctOptionIds: [],
  }
}

export function createEmptyDraft(): QuizDraft {
  return {
    title: '',
    description: '',
    countries: [],
    timeLimitSeconds: null,
    perQuestionSeconds: null,
    retakesAllowed: true,
    questions: [createQuestion()],
  }
}

export function toDraft(quiz: Quiz): QuizDraft {
  return structuredClone({
    title: quiz.title,
    description: quiz.description,
    countries: quiz.countries,
    timeLimitSeconds: quiz.timeLimitSeconds,
    perQuestionSeconds: quiz.perQuestionSeconds,
    retakesAllowed: quiz.retakesAllowed,
    questions: quiz.questions,
  })
}

export function validateQuiz(draft: QuizDraft): QuizFormErrors {
  const errors: QuizFormErrors = { byQuestion: {} }

  if (!draft.title.trim()) errors.title = 'Title is required.'
  if (draft.questions.length === 0) errors.questions = 'Add at least one question.'
  if (
    (draft.timeLimitSeconds !== null && draft.timeLimitSeconds <= 0) ||
    (draft.perQuestionSeconds !== null && draft.perQuestionSeconds <= 0)
  ) {
    errors.timeLimit = 'Time limits must be greater than zero, or left empty for no limit.'
  }

  for (const question of draft.questions) {
    const qErrors: QuestionErrors = {}
    if (!question.text.trim()) qErrors.text = 'Question text is required.'
    if (question.options.length < 2) qErrors.options = 'Add at least two options.'
    else if (question.options.some((o) => !o.text.trim()))
      qErrors.options = 'Options cannot be empty.'
    if (question.correctOptionIds.length === 0)
      qErrors.correct = 'Mark at least one correct option.'
    else if (question.type === 'single' && question.correctOptionIds.length !== 1)
      qErrors.correct = 'Single-choice questions need exactly one correct option.'
    if (Object.keys(qErrors).length > 0) errors.byQuestion[question.id] = qErrors
  }

  return errors
}

export function hasErrors(errors: QuizFormErrors): boolean {
  return Boolean(
    errors.title || errors.questions || errors.timeLimit || Object.keys(errors.byQuestion).length,
  )
}
