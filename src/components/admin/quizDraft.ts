import type { Option, Question, Quiz, QuizInput } from '../../types/models'
import { createId } from '../../utils/createId'

export type QuizDraft = QuizInput

export function createOption(): Option {
  return { id: createId('opt'), text: '' }
}

export function createQuestion(): Question {
  return {
    id: createId('question'),
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

/** "What is…? · Single choice · 4 options" */
export function describeQuestion(question: Question): string {
  const type = question.type === 'single' ? 'Single choice' : 'Multiple choice'
  const count = question.options.length
  const text = question.text.trim() || 'No question text yet'
  return `${text} · ${type} · ${count} ${count === 1 ? 'option' : 'options'}`
}
