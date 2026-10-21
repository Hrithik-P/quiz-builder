import type { ImportOutcome } from '../../hooks/useQuizImport'
import { Button } from '../ui/Button'

interface ImportOutcomeNoticeProps {
  outcome: ImportOutcome
  onDismiss: () => void
}

/** Says what the last import did. A rejected file lists every problem found in it. */
export function ImportOutcomeNotice({ outcome, onDismiss }: ImportOutcomeNoticeProps) {
  if (outcome.status === 'idle') return null

  const isRejected = outcome.status === 'rejected'

  return (
    <div
      role={isRejected ? 'alert' : 'status'}
      className={`flex flex-col gap-3 rounded-2xl border-2 p-4 text-sm sm:flex-row sm:items-start sm:justify-between ${
        isRejected ? 'border-danger bg-danger/10' : 'border-accent bg-accent/10'
      }`}
    >
      {isRejected ? (
        <div>
          <p className="font-bold text-danger">The file was not imported. Nothing was changed.</p>
          <ul className="mt-2 list-disc pl-5">
            {outcome.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="font-medium">
          Imported {outcome.count} {outcome.count === 1 ? 'quiz' : 'quizzes'}.
        </p>
      )}
      <Button variant="ghost" size="sm" className="self-start" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  )
}
