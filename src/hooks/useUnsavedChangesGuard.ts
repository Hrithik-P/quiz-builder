import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router'

/**
 * Holds in-app navigation for confirmation while `dirty`; closing the tab gets the browser prompt.
 * Call `allowLeave` before navigating away on purpose (e.g. after saving).
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const leaving = useRef(false)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  return {
    blocked: blocker.state === 'blocked',
    proceed: () => blocker.proceed?.(),
    stay: () => blocker.reset?.(),
    allowLeave: () => {
      leaving.current = true
    },
  }
}
