import { isRouteErrorResponse } from 'react-router'

export interface RouteErrorMessage {
  title: string
  description: string
  /** Reloading can help for a crash or a failed download, but not for a missing page. */
  canRetry: boolean
}

/** The wording differs by browser: Chrome, Firefox and Safari each phrase a failed chunk download. */
const CHUNK_LOAD_FAILURE = /dynamically imported module|importing a module script failed/i

/**
 * Turns whatever was thrown into something a person can act on. The raw message and stack are
 * never shown: they are for the console, not for the user.
 */
export function describeRouteError(error: unknown): RouteErrorMessage {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return {
      title: 'Page not found',
      description: 'This page does not exist. It may have been moved or removed.',
      canRetry: false,
    }
  }

  if (error instanceof Error && CHUNK_LOAD_FAILURE.test(error.message)) {
    return {
      title: 'Could not load this page',
      description: 'Part of the app failed to download. Check your connection and try again.',
      canRetry: true,
    }
  }

  return {
    title: 'Something went wrong',
    description: 'This screen hit an unexpected problem. Try again, or head back to the quizzes.',
    canRetry: true,
  }
}
