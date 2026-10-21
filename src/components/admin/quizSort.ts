import type { Quiz } from '../../types/models'

export type QuizSortKey = 'title-asc' | 'title-desc' | 'questions-desc' | 'questions-asc'

export const quizSortOptions: { value: QuizSortKey; label: string }[] = [
  { value: 'title-asc', label: 'Title (A–Z)' },
  { value: 'title-desc', label: 'Title (Z–A)' },
  { value: 'questions-desc', label: 'Most questions' },
  { value: 'questions-asc', label: 'Fewest questions' },
]

const comparators: Record<QuizSortKey, (a: Quiz, b: Quiz) => number> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'questions-desc': (a, b) => b.questions.length - a.questions.length,
  'questions-asc': (a, b) => a.questions.length - b.questions.length,
}

export function searchAndSortQuizzes(quizzes: Quiz[], search: string, sort: QuizSortKey): Quiz[] {
  const term = search.trim().toLowerCase()
  return quizzes
    .filter(
      (q) => q.title.toLowerCase().includes(term) || q.description.toLowerCase().includes(term),
    )
    .toSorted(comparators[sort])
}
