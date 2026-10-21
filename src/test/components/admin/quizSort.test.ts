import { describe, expect, it } from 'vitest'
import { searchAndSortQuizzes } from '../../../components/admin/quizSort'
import seedJson from '../../../data/seed.json'
import type { Database } from '../../../types/models'

const { quizzes } = seedJson as Database

describe('searchAndSortQuizzes', () => {
  it('matches title or description, ignoring case and spaces', () => {
    const ids = searchAndSortQuizzes(quizzes, '  HOOKS ', 'title-asc').map((quiz) => quiz.id)
    expect(ids).toEqual(['q2']) // "Hooks, rendering and component basics."
  })

  it('sorts by question count', () => {
    const counts = searchAndSortQuizzes(quizzes, '', 'questions-desc').map(
      (quiz) => quiz.questions.length,
    )
    expect(counts).toEqual([7, 6, 6, 5, 5])
  })

  it('does not reorder the original array', () => {
    const before = quizzes.map((quiz) => quiz.id)
    searchAndSortQuizzes(quizzes, '', 'title-desc')
    expect(quizzes.map((quiz) => quiz.id)).toEqual(before)
  })
})
