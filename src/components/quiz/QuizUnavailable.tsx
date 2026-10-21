import { Link } from 'react-router'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

interface QuizUnavailableProps {
  reason: 'not-found' | 'attempt-not-found' | 'deleted' | 'edited'
}

const messages: Record<QuizUnavailableProps['reason'], { title: string; description: string }> = {
  'not-found': {
    title: 'Quiz not found',
    description: 'This quiz does not exist. It may have been removed.',
  },
  'attempt-not-found': {
    title: 'Attempt not found',
    description: 'This attempt does not exist, or it belongs to a different quiz or person.',
  },
  deleted: {
    title: 'This quiz was deleted',
    description: 'The quiz was removed while you were taking it, so this attempt cannot continue.',
  },
  edited: {
    title: 'This quiz was changed',
    description:
      'An admin edited the quiz while you were taking it. Start again to get the latest version.',
  },
}

export function QuizUnavailable({ reason }: QuizUnavailableProps) {
  const { title, description } = messages[reason]
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button asChild>
          <Link to="/">Back to quizzes</Link>
        </Button>
      }
    />
  )
}
