import { afterEach, describe, expect, it, vi } from 'vitest'
import { createId } from '../../utils/createId'

afterEach(() => {
  vi.unstubAllGlobals()
})

/** What `crypto` looks like on a plain-http page: random bytes, but no `randomUUID`. */
function stubInsecureContext() {
  vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })
}

describe('createId', () => {
  it('starts with the prefix and ends with random hex', () => {
    expect(createId('quiz')).toMatch(/^quiz-[0-9a-f]{12}$/)
  })

  it('gives a different id every time', () => {
    const ids = new Set(Array.from({ length: 2000 }, () => createId('attempt')))
    expect(ids.size).toBe(2000)
  })

  it('works where crypto.randomUUID does not exist (a plain-http page)', () => {
    stubInsecureContext()
    expect(crypto.randomUUID).toBeUndefined()

    expect(createId('opt')).toMatch(/^opt-[0-9a-f]{12}$/)
  })
})
