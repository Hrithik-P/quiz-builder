import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

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
  localStorage.clear()
})
