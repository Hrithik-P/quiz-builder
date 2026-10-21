import { Link } from 'react-router'
import { cardClass } from '../../styles/styles'
import type { Quiz } from '../../types/models'
import { formatTimeLimit } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface AdminQuizRowProps {
  quiz: Quiz
  onDelete: (quiz: Quiz) => void
}

export function AdminQuizRow({ quiz, onDelete }: AdminQuizRowProps) {
  return (
    <li className={`${cardClass} flex flex-col gap-3 md:flex-row md:items-center`}>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold">{quiz.title}</h2>
        <p className="truncate text-sm text-muted">{quiz.description}</p>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Quiz details">
          <li>
            <Badge>{quiz.questions.length} questions</Badge>
          </li>
          <li>
            <Badge>{formatTimeLimit(quiz)}</Badge>
          </li>
          <li>
            <Badge variant={quiz.retakesAllowed ? 'success' : 'accent'}>
              {quiz.retakesAllowed ? 'Retakes allowed' : 'No retakes'}
            </Badge>
          </li>
          {quiz.countries.map((code) => (
            <li key={code}>
              <Badge>{code}</Badge>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <Button
          asChild
          variant="secondary"
          className="flex-1 md:flex-none"
          aria-label={`Edit ${quiz.title}`}
        >
          <Link to={`/admin/${quiz.id}/edit`}>Edit</Link>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 text-danger md:flex-none"
          onClick={() => onDelete(quiz)}
          aria-label={`Delete ${quiz.title}`}
        >
          Delete
        </Button>
      </div>
    </li>
  )
}
