import { useEffect } from 'react'
import { Link, useNavigate, useRouteError } from 'react-router'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { describeRouteError } from './describeRouteError'

/**
 * Shown by React Router when a screen throws while rendering or its lazy chunk fails to load.
 * Errors in event handlers and async code do not reach it; those are handled where they happen.
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { title, description, canRetry } = describeRouteError(error)

  useEffect(() => {
    // The user sees a friendly message, so keep the real error for whoever debugs it.
    console.error('Route error:', error)
  }, [error])

  return (
    <div role="alert" className="mx-auto max-w-3xl p-4 pt-10">
      <EmptyState
        title={title}
        description={description}
        action={
          <>
            {canRetry ? <Button onClick={() => navigate(0)}>Try again</Button> : null}
            <Button asChild variant="secondary">
              <Link to="/">Back to quizzes</Link>
            </Button>
          </>
        }
      />
    </div>
  )
}
