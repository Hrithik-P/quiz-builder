import { displayClass } from '../../styles/styles'
import { quizTileClass } from '../../utils/quizTheme'
import { BackLink } from '../ui/BackLink'

interface QuizHeroProps {
  quizId: string
  headingId: string
  title: string
  description: string
  badge?: string
}

export function QuizHero({ quizId, headingId, title, description, badge }: QuizHeroProps) {
  return (
    <header
      className={`@container relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-edge p-5 text-tile-fg sm:min-h-80 sm:p-8 lg:p-10 ${quizTileClass(quizId)}`}
    >
      <BackLink surface="tile" />
      <div className="flex-1" />
      <div className="relative flex max-w-xl flex-col gap-3 pt-10 sm:pt-16 lg:gap-4">
        {badge ? (
          <span className="self-start rounded-full bg-tile-fg px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-white uppercase">
            {badge}
          </span>
        ) : null}
        {/* Scales with the tile on large screens, so long words fit. */}
        <h1
          id={headingId}
          className={`${displayClass} text-4xl leading-none [overflow-wrap:anywhere] sm:text-5xl lg:text-[min(3.75rem,15cqi)]`}
        >
          {title}
        </h1>
        <p className="text-lg font-medium lg:text-xl">{description}</p>
      </div>
    </header>
  )
}
