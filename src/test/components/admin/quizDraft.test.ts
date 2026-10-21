import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createEmptyDraft,
  createQuestion,
  describeQuestion,
} from '../../../components/admin/quizDraft'

describe('describeQuestion', () => {
  it('summarises the text, type and option count', () => {
    const question = { ...createQuestion(), text: ' What is 2 + 2? ', type: 'multiple' as const }
    expect(describeQuestion(question)).toBe('What is 2 + 2? · Multiple choice · 2 options')
  })

  it('says when there is no text yet', () => {
    expect(describeQuestion(createQuestion())).toBe(
      'No question text yet · Single choice · 2 options',
    )
  })
})

describe('a new quiz form on a plain-http page, where crypto.randomUUID does not exist', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('still builds a blank quiz with ids for its question and options', () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })

    const [question] = createEmptyDraft().questions

    expect(question?.id).toMatch(/^question-/)
    expect(question?.options.map((option) => option.id)).toEqual([
      expect.stringMatching(/^opt-/),
      expect.stringMatching(/^opt-/),
    ])
  })
})
