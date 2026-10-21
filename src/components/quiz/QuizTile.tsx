import { quizMonogram, quizTileClass } from '../../utils/quizTheme'

interface QuizTileProps {
  quizId: string
  title: string
  className?: string
}

export function QuizTile({
  quizId,
  title,
  className = 'size-12 rounded-2xl text-lg',
}: QuizTileProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center border-2 border-edge font-display font-extrabold text-tile-fg ${quizTileClass(quizId)} ${className}`}
    >
      {quizMonogram(title)}
    </span>
  )
}
