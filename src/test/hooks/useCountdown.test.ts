import { createElement } from 'react'
import { act, render, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from '../../hooks/useCountdown'

const NOW = '2026-10-21T10:00:00Z'

function endsInSeconds(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString()
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useCountdown', () => {
  it('counts down from the deadline', () => {
    const endsAt = endsInSeconds(5)
    const { result } = renderHook(() => useCountdown(endsAt))
    expect(result.current).toBe(5)

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current).toBe(2)
  })

  it('calls onExpire once when it reaches zero and stays at zero', () => {
    const onExpire = vi.fn()
    const endsAt = endsInSeconds(5)
    const { result } = renderHook(() => useCountdown(endsAt, onExpire))

    act(() => vi.advanceTimersByTime(4000))
    expect(onExpire).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toBe(0)
    expect(onExpire).toHaveBeenCalledTimes(1)

    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current).toBe(0)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('catches up from the clock when a background tab was throttled', () => {
    const onExpire = vi.fn()
    const endsAt = endsInSeconds(30)
    const { result } = renderHook(() => useCountdown(endsAt, onExpire))

    // The tab slept: the clock moved on but no interval ticks ran.
    vi.setSystemTime(Date.now() + 45_000)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current).toBe(0)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('restarts for a new deadline, such as the next question', () => {
    const onExpire = vi.fn()
    const firstEnd = endsInSeconds(2)
    const { result, rerender } = renderHook(({ endsAt }) => useCountdown(endsAt, onExpire), {
      initialProps: { endsAt: firstEnd },
    })

    act(() => vi.advanceTimersByTime(2000))
    expect(onExpire).toHaveBeenCalledTimes(1)

    rerender({ endsAt: endsInSeconds(30) })
    expect(result.current).toBe(30)

    act(() => vi.advanceTimersByTime(30_000))
    expect(onExpire).toHaveBeenCalledTimes(2)
  })

  it('does nothing without a deadline', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown(null, onExpire))

    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current).toBeNull()
    expect(onExpire).not.toHaveBeenCalled()
  })

  // Regression: every 250 ms tick used to re-render the whole attempt screen.
  it('re-renders the children once per displayed second, not on every tick', () => {
    let childRenderCount = 0
    function Child() {
      childRenderCount += 1
      return null
    }
    function Timer({ endsAt }: { endsAt: string }) {
      useCountdown(endsAt)
      return createElement(Child)
    }
    render(createElement(Timer, { endsAt: endsInSeconds(10) }))
    const initialRenderCount = childRenderCount

    // One act per tick: a single act would batch all the updates into one render.
    for (let tick = 0; tick < 12; tick += 1) {
      act(() => vi.advanceTimersByTime(250))
    }
    expect(childRenderCount - initialRenderCount).toBe(3)
  })
})
