import { describe, expect, it } from 'vitest'
import { createQuestion, describeQuestion } from '../../../components/admin/quizDraft'

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
