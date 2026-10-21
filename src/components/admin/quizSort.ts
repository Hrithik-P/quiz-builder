import type { Quiz } from '../../types/models'

export type QuizSortKey = 'title-asc' | 'title-desc' | 'questions-desc' | 'questions-asc'

export const quizSortOptions: { value: QuizSortKey; label: string }[] = [
  { value: 'title-asc', label: 'Title (A–Z)' },
  { value: 'title-desc', label: 'Title (Z–A)' },
  { value: 'questions-desc', label: 'Most questions' },
  { value: 'questions-asc', label: 'Fewest questions' },
]

const comparators: Record<QuizSortKey, (first: Quiz, second: Quiz) => number> = {
  'title-asc': (first, second) => first.title.localeCompare(second.title),
  'title-desc': (first, second) => second.title.localeCompare(first.title),
  'questions-desc': (first, second) => second.questions.length - first.questions.length,
  'questions-asc': (first, second) => first.questions.length - second.questions.length,
}

export function searchAndSortQuizzes(quizzes: Quiz[], search: string, sort: QuizSortKey): Quiz[] {
  const term = search.trim().toLowerCase()
  return quizzes
    .filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(term) || quiz.description.toLowerCase().includes(term),
    )
    .toSorted(comparators[sort])
}
