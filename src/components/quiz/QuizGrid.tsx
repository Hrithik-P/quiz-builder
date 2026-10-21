import { eyebrowClass } from '../../styles/styles'
import type { QuizSummary } from '../../types/views'
import { Skeleton } from '../ui/Skeleton'
import { QuizCard, QuizCardSkeleton } from './QuizCard'

interface QuizGridProps {
  title: string
  quizzes: QuizSummary[]
}

export function QuizGrid({ title, quizzes }: QuizGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className={eyebrowClass}>{title}</h2>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="grid">
            <QuizCard quiz={quiz} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const SKELETON_CARDS = 3

export function QuizGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading quizzes" className="flex flex-col gap-6">
      <Skeleton className="h-44 rounded-3xl" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: SKELETON_CARDS }, (_card, index) => (
          <QuizCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
