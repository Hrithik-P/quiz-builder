import { Link } from 'react-router'
import { ArrowRightIcon } from 'lucide-react'
import type { Attempt } from '../../types/models'
import type { QuizSummary } from '../../types/views'
import { quizTileClass } from '../../utils/quizTheme'

interface ResumeBannerProps {
  quiz: QuizSummary
  attempt: Attempt
}

export function ResumeBanner({ quiz, attempt }: ResumeBannerProps) {
  const answered = attempt.currentQuestionIndex
  const total = attempt.totalQuestions

  return (
    <article
      className={`relative flex flex-col gap-4 overflow-hidden rounded-3xl border-2 border-edge p-5 text-tile-fg shadow-pop sm:flex-row sm:items-center sm:gap-6 sm:p-7 ${quizTileClass(quiz.id)}`}
    >
      <div className="relative flex flex-1 flex-col gap-2">
        <span className="self-start rounded-full bg-tile-fg px-3 py-1 text-xs font-bold tracking-[0.08em] text-white uppercase">
          In progress · question {Math.min(answered + 1, total)} of {total}
        </span>
        <h2 className="font-display text-3xl leading-none font-extrabold sm:text-4xl">
          {quiz.title}
        </h2>
        <p className="font-medium">{quiz.description}</p>
        <div aria-hidden="true" className="mt-1 flex max-w-sm gap-1.5">
          {Array.from({ length: total }, (_segment, index) => (
            <span
              key={index}
              className={`h-2.5 flex-1 rounded-full ${index < answered ? 'bg-tile-fg' : 'bg-tile-fg/20'}`}
            />
          ))}
        </div>
      </div>
      <Link
        to={`/quiz/${quiz.id}/attempt/${attempt.id}`}
        className="relative inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl border-2 border-edge bg-white px-5 font-display text-lg font-extrabold text-tile-fg no-underline shadow-pop transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-pop-lg active:translate-y-0.5 active:shadow-none sm:self-center"
      >
        Resume quiz
        <ArrowRightIcon />
      </Link>
    </article>
  )
}
