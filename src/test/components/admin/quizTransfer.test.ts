import { describe, expect, it } from 'vitest'
import { toDraft } from '../../../components/admin/quizDraft'
import {
  getExportFilename,
  parseQuizFile,
  QUIZ_FILE_FORMAT,
  QUIZ_FILE_VERSION,
  serializeQuizzes,
} from '../../../components/admin/quizTransfer'
import seedJson from '../../../data/seed.json'
import type { Database, QuizInput } from '../../../types/models'

const seed = seedJson as Database
const COUNTRIES = ['IN', 'AE', 'GB']
const EXPORTED_AT = new Date('2026-10-21T10:00:00Z')

function validQuiz(): QuizInput {
  return {
    title: 'Sample quiz',
    description: 'For tests',
    countries: ['IN'],
    timeLimitSeconds: 300,
    perQuestionSeconds: null,
    retakesAllowed: true,
    questions: [
      {
        id: 'question-1',
        text: 'Pick one',
        type: 'single',
        options: [
          { id: 'option-1', text: 'Yes' },
          { id: 'option-2', text: 'No' },
        ],
        correctOptionIds: ['option-1'],
      },
    ],
  }
}

function fileOf(...quizzes: unknown[]): string {
  return JSON.stringify({ format: QUIZ_FILE_FORMAT, version: QUIZ_FILE_VERSION, quizzes })
}

function errorsOf(text: string): string[] {
  const result = parseQuizFile(text, COUNTRIES)
  if (result.ok) throw new Error('Expected the file to be rejected')
  return result.errors
}

/** A quiz with one change, to test one rule at a time. */
function withFirstQuestion(change: Record<string, unknown>) {
  const quiz = validQuiz()
  const [question] = quiz.questions
  return { ...quiz, questions: [{ ...question, ...change }] }
}

describe('serializeQuizzes', () => {
  it('writes a header and the quizzes without ids or revisions', () => {
    const file = JSON.parse(serializeQuizzes(seed.quizzes, EXPORTED_AT)) as Record<string, unknown>

    expect(file).toMatchObject({
      format: QUIZ_FILE_FORMAT,
      version: QUIZ_FILE_VERSION,
      exportedAt: '2026-10-21T10:00:00.000Z',
    })
    const [first] = file.quizzes as Record<string, unknown>[]
    expect(first).not.toHaveProperty('id')
    expect(first).not.toHaveProperty('revision')
    expect(first).toHaveProperty('title', 'JavaScript Basics')
  })

  it('names the file after the date', () => {
    expect(getExportFilename(EXPORTED_AT)).toBe('quizzes-2026-10-21.json')
  })
})

describe('parseQuizFile', () => {
  it('reads back exactly what was exported, for every seed quiz', () => {
    const result = parseQuizFile(serializeQuizzes(seed.quizzes, EXPORTED_AT), COUNTRIES)

    expect(result).toEqual({ ok: true, quizzes: seed.quizzes.map(toDraft) })
  })

  it('accepts a file with a single quiz', () => {
    const result = parseQuizFile(fileOf(validQuiz()), COUNTRIES)
    expect(result.ok && result.quizzes).toHaveLength(1)
  })

  it('trims text and ignores keys it does not know', () => {
    const result = parseQuizFile(
      fileOf({ ...validQuiz(), title: '  Padded  ', extra: true }),
      COUNTRIES,
    )

    expect(result.ok && result.quizzes[0]).toMatchObject({ title: 'Padded' })
    expect(result.ok && result.quizzes[0]).not.toHaveProperty('extra')
  })

  it('accepts an option image that is an https link', () => {
    const quiz = withFirstQuestion({
      options: [
        { id: 'option-1', text: 'Yes', imageUrl: 'https://example.com/a.png' },
        { id: 'option-2', text: 'No' },
      ],
    })
    expect(parseQuizFile(fileOf(quiz), COUNTRIES).ok).toBe(true)
  })

  describe('rejects a file that is not a quiz export', () => {
    it.each([
      ['text that is not JSON', 'not json at all', 'This file is not valid JSON.'],
      ['an empty file', '', 'This file is not valid JSON.'],
      ['JSON null', 'null', 'This is not a quiz file exported from this app.'],
      ['a number', '42', 'This is not a quiz file exported from this app.'],
      [
        'a bare list of quizzes',
        JSON.stringify([validQuiz()]),
        'This is not a quiz file exported from this app.',
      ],
      [
        'another kind of file',
        JSON.stringify({ format: 'something-else', version: 1, quizzes: [] }),
        'This is not a quiz file exported from this app.',
      ],
    ])('%s', (_label, text, message) => {
      expect(errorsOf(text)).toEqual([message])
    })

    it('a newer file version', () => {
      const text = JSON.stringify({ format: QUIZ_FILE_FORMAT, version: 2, quizzes: [validQuiz()] })
      expect(errorsOf(text)).toEqual(['Unsupported file version. This app reads version 1.'])
    })

    it('a file with no quizzes', () => {
      expect(errorsOf(fileOf())).toEqual(['The file does not contain any quizzes.'])
    })
  })

  describe('rejects a quiz that breaks the admin form’s rules, naming the quiz and the place', () => {
    it('a missing title', () => {
      expect(errorsOf(fileOf({ ...validQuiz(), title: '  ' }))).toEqual([
        'Quiz 1, title: Title is required.',
      ])
    })

    it('no correct option', () => {
      const errors = errorsOf(fileOf(withFirstQuestion({ correctOptionIds: [] })))
      expect(errors).toEqual([
        'Quiz 1 (“Sample quiz”), question 1, correctOptionIds: Mark at least one correct option.',
      ])
    })

    it('two correct options on a single-choice question', () => {
      const errors = errorsOf(
        fileOf(withFirstQuestion({ correctOptionIds: ['option-1', 'option-2'] })),
      )
      expect(errors[0]).toContain('Single-choice questions need exactly one correct option.')
    })

    it('fewer than two options', () => {
      const errors = errorsOf(
        fileOf(withFirstQuestion({ options: [{ id: 'option-1', text: 'Only' }] })),
      )
      expect(errors[0]).toContain('Add at least two options.')
    })

    it('a wrong type, such as text where a number belongs', () => {
      const errors = errorsOf(fileOf({ ...validQuiz(), timeLimitSeconds: 'soon' }))
      expect(errors[0]).toMatch(/^Quiz 1 \(“Sample quiz”\), timeLimitSeconds: /)
    })

    it('a quiz that is not an object', () => {
      expect(errorsOf(fileOf('oops'))).toHaveLength(1)
      expect(errorsOf(fileOf(null))[0]).toMatch(/^Quiz 1: /)
    })
  })

  describe('rejects problems only a file can have', () => {
    it('an unknown country', () => {
      const errors = errorsOf(fileOf({ ...validQuiz(), countries: ['IN', 'XX'] }))
      expect(errors).toEqual(['Quiz 1 (“Sample quiz”): unknown country code “XX”.'])
    })

    it('two questions with the same id', () => {
      const quiz = validQuiz()
      const [question] = quiz.questions
      const errors = errorsOf(fileOf({ ...quiz, questions: [question, question] }))
      expect(errors).toEqual(['Quiz 1 (“Sample quiz”): two questions share the same id.'])
    })

    it('two options with the same id', () => {
      const errors = errorsOf(
        fileOf(
          withFirstQuestion({
            options: [
              { id: 'option-1', text: 'Yes' },
              { id: 'option-1', text: 'No' },
            ],
          }),
        ),
      )
      expect(errors).toEqual(['Quiz 1 (“Sample quiz”), question 1: two options share the same id.'])
    })

    it('a correct answer that points at an option that does not exist', () => {
      const errors = errorsOf(
        fileOf(withFirstQuestion({ correctOptionIds: ['option-1', 'ghost'] })),
      )
      expect(errors[0]).toContain('points at an option that does not exist')
    })

    it.each([
      'javascript:alert(1)',
      'data:text/html,<b>x</b>',
      'not a url',
      'ftp://example.com/a.png',
    ])('an option image that is not an http(s) link: %s', (imageUrl) => {
      const quiz = withFirstQuestion({
        options: [
          { id: 'option-1', text: 'Yes', imageUrl },
          { id: 'option-2', text: 'No' },
        ],
      })
      expect(errorsOf(fileOf(quiz))).toEqual([
        'Quiz 1 (“Sample quiz”), question 1, option 1: the image must be an http or https link.',
      ])
    })
  })

  describe('with several quizzes', () => {
    it('imports nothing if any one is invalid, and says which', () => {
      const errors = errorsOf(
        fileOf(validQuiz(), { ...validQuiz(), title: 'Second', countries: [] }),
      )
      expect(errors).toEqual(['Quiz 2 (“Second”), countries: Assign at least one country.'])
    })

    it('collects the problems from every quiz', () => {
      const errors = errorsOf(
        fileOf({ ...validQuiz(), title: '' }, validQuiz(), { ...validQuiz(), countries: ['XX'] }),
      )
      expect(errors).toHaveLength(2)
      expect(errors[0]).toMatch(/^Quiz 1/)
      expect(errors[1]).toMatch(/^Quiz 3/)
    })

    it('shows the first 10 problems and counts the rest', () => {
      const broken = Array.from({ length: 13 }, () => ({ ...validQuiz(), title: '' }))
      const errors = errorsOf(fileOf(...broken))

      expect(errors).toHaveLength(11)
      expect(errors[10]).toBe('…and 3 more problems.')
    })
  })
})
