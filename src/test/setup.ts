import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { useQuizStore } from '../store/quizStore'
import { DEFAULT_USER_ID, useSessionStore } from '../store/sessionStore'

// Browser APIs that Radix uses and jsdom lacks.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => undefined
Element.prototype.scrollIntoView ??= () => undefined

afterEach(() => {
  cleanup()
  // The store lives in memory, so put the seed back before clearing what it saved.
  useQuizStore.getState().resetData()
  useSessionStore.setState({ userId: DEFAULT_USER_ID })
  localStorage.clear()
})
