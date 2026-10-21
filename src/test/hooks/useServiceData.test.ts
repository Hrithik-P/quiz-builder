import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useServiceData } from '../../hooks/useServiceData'
import { getQuizzes } from '../../services/quizQueries'
import { useQuizStore } from '../../store/quizStore'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function renderQuizCount(key = 'admin') {
  return renderHook(({ dataKey }) => useServiceData(dataKey, (data) => data.quizzes.length, 500), {
    initialProps: { dataKey: key },
  })
}

describe('useServiceData', () => {
  it('is loading until the simulated delay has passed', () => {
    const { result } = renderQuizCount()
    expect(result.current).toEqual({ data: undefined, loading: true })

    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toEqual({ data: 5, loading: false })
  })

  it('shows the loading state again when the key changes', () => {
    const { result, rerender } = renderQuizCount('first')
    act(() => vi.advanceTimersByTime(500))

    rerender({ dataKey: 'second' })
    expect(result.current.loading).toBe(true)
  })

  it('re-reads after a change to the store without showing the loading state', () => {
    const { result } = renderQuizCount()
    act(() => vi.advanceTimersByTime(500))

    act(() => useQuizStore.getState().deleteQuiz('q1'))

    expect(result.current).toEqual({ data: 4, loading: false })
  })

  it('shows a newly completed attempt in the quiz list', () => {
    const { result } = renderHook(() =>
      useServiceData('u5', (data) => getQuizzes(data, 'u5').find((quiz) => quiz.id === 'q1')),
    )
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.data?.completed).toBe(false)

    act(() => {
      const started = useQuizStore.getState().startOrResumeAttempt('q1', 'u5')
      if (started.ok) useQuizStore.getState().completeAttempt(started.attempt.id)
    })

    expect(result.current.data?.completed).toBe(true)
  })
})
