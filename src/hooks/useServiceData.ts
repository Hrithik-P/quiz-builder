import { useEffect, useEffectEvent, useState } from 'react'

/** Loads after a simulated delay so loading states show. Reloads when `key` changes. */
export function useServiceData<T>(
  key: string,
  load: () => T,
  delayMs = 500,
): { data: T | undefined; loading: boolean } {
  const [state, setState] = useState<{ key: string; data: T } | null>(null)
  const onLoaded = useEffectEvent(() => setState({ key, data: load() }))

  useEffect(() => {
    const timer = setTimeout(() => onLoaded(), delayMs)
    return () => clearTimeout(timer)
  }, [key, delayMs])

  const loading = state?.key !== key
  return { data: loading ? undefined : state.data, loading }
}
