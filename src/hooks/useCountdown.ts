import { useEffect, useEffectEvent, useState } from 'react'

const TICK_MS = 250

/**
 * Whole seconds left until `endsAt` (an ISO timestamp), or null when there is no deadline.
 * The value is derived from the clock on every tick, not counted down, so a reload or a throttled
 * background tab can never drift. `onExpire` runs once when the deadline is reached.
 */
export function useCountdown(endsAt: string | null, onExpire?: () => void): number | null {
  const [nowMs, setNowMs] = useState(() => Date.now())
  const handleExpire = useEffectEvent(() => onExpire?.())

  useEffect(() => {
    if (endsAt === null) return
    const refresh = () => setNowMs(Date.now())
    const timer = setInterval(refresh, TICK_MS)
    // Background tabs throttle timers, so catch up the moment the tab is visible again.
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [endsAt])

  const remainingSeconds =
    endsAt === null ? null : Math.max(0, Math.ceil((Date.parse(endsAt) - nowMs) / 1000))
  const isExpired = remainingSeconds === 0

  useEffect(() => {
    if (isExpired) handleExpire()
  }, [isExpired, endsAt])

  return remainingSeconds
}
