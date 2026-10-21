import { useEffect, useState } from 'react'
import { useQuizData } from '../store/quizStore'
import type { QuizData } from '../types/models'

/**
 * Reads from the store, but shows a loading state for `delayMs` the first time `key` is seen (the
 * simulated delay). Later changes to the data show up straight away, with no loading flash.
 */
export function useServiceData<Result>(
  key: string,
  read: (data: QuizData) => Result,
  delayMs = 500,
): { data: Result | undefined; loading: boolean } {
  const quizData = useQuizData()
  const [readyKey, setReadyKey] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setReadyKey(key), delayMs)
    return () => clearTimeout(timer)
  }, [key, delayMs])

  const loading = readyKey !== key
  return { data: loading ? undefined : read(quizData), loading }
}
