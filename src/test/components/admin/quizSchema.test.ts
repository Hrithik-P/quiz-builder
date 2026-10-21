import { describe, expect, it } from 'vitest'
import { createQuestion, type QuizDraft } from '../../../components/admin/quizDraft'
import { quizSchema } from '../../../components/admin/quizSchema'

function validDraft(): QuizDraft {
  const question = createQuestion()
  const [first, second] = question.options
  return {
    title: 'Quiz',
    description: '',
    countries: ['IN'],
    timeLimitSeconds: 300,
    perQuestionSeconds: null,
    retakesAllowed: true,
    questions: [
      {
        ...question,
        text: 'Question?',
        options: [
          { id: first?.id ?? 'a', text: 'Yes' },
          { id: second?.id ?? 'b', text: 'No' },
        ],
        correctOptionIds: [first?.id ?? 'a'],
      },
    ],
  }
}

function firstQuestion(draft: QuizDraft) {
  const [question] = draft.questions
  if (!question) throw new Error('No question')
  return question
}

/** Error messages keyed by path, e.g. { "questions.0.text": "…" }. */
function errorsOf(draft: QuizDraft) {
  const result = quizSchema.safeParse(draft)
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.'), issue.message]))
}

describe('quizSchema', () => {
  it('accepts a valid quiz and trims text', () => {
    const draft = validDraft()
    draft.title = '  Quiz  '
    expect(quizSchema.parse(draft).title).toBe('Quiz')
  })

  it('requires a title, a country and a question', () => {
    const draft = { ...validDraft(), title: '  ', countries: [], questions: [] }
    expect(errorsOf(draft)).toEqual({
      title: 'Title is required.',
      countries: 'Assign at least one country.',
      questions: 'Add at least one question.',
    })
  })

  it('allows empty time limits but not zero, negative or fractional seconds', () => {
    expect(errorsOf({ ...validDraft(), timeLimitSeconds: null })).toEqual({})
    expect(errorsOf({ ...validDraft(), timeLimitSeconds: 0, perQuestionSeconds: 2.5 })).toEqual({
      timeLimitSeconds: 'Enter a time above zero, or leave it empty.',
      perQuestionSeconds: 'Use whole seconds.',
    })
  })

  it('checks question text, option count and option text', () => {
    const draft = validDraft()
    const question = firstQuestion(draft)
    question.text = ''
    question.options = [{ id: 'a', text: ' ' }]
    question.correctOptionIds = ['a']
    expect(errorsOf(draft)).toEqual({
      'questions.0.text': 'Question text is required.',
      'questions.0.options': 'Add at least two options.',
      'questions.0.options.0.text': 'Enter the option text.',
    })
  })

  it('needs a correct option, and exactly one for single choice', () => {
    const draft = validDraft()
    const question = firstQuestion(draft)
    question.correctOptionIds = []
    expect(errorsOf(draft)).toEqual({
      'questions.0.correctOptionIds': 'Mark at least one correct option.',
    })

    question.correctOptionIds = question.options.map((option) => option.id)
    expect(errorsOf(draft)).toEqual({
      'questions.0.correctOptionIds': 'Single-choice questions need exactly one correct option.',
    })

    question.type = 'multiple'
    expect(errorsOf(draft)).toEqual({})
  })

  it('ignores correct ids of options that no longer exist', () => {
    const draft = validDraft()
    firstQuestion(draft).correctOptionIds = ['removed-option']
    expect(errorsOf(draft)).toEqual({
      'questions.0.correctOptionIds': 'Mark at least one correct option.',
    })
  })
})
