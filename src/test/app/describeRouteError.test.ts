import { describe, expect, it } from 'vitest'
import { describeRouteError } from '../../app/describeRouteError'

describe('describeRouteError', () => {
  it('describes a missing page and offers no retry', () => {
    // The shape React Router hands the boundary for a 404 response.
    const response = { status: 404, statusText: 'Not Found', internal: false, data: null }
    expect(describeRouteError(response)).toMatchObject({ title: 'Page not found', canRetry: false })
  })

  it.each([
    'Failed to fetch dynamically imported module: http://localhost/assets/Admin.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
  ])('recognises a failed download in any browser: %s', (message) => {
    const described = describeRouteError(new TypeError(message))
    expect(described).toMatchObject({ title: 'Could not load this page', canRetry: true })
  })

  it('uses a generic message for anything else and never leaks the error text', () => {
    const described = describeRouteError(new Error('Cannot read properties of undefined (secret)'))
    expect(described.title).toBe('Something went wrong')
    expect(described.description).not.toContain('secret')
    expect(described.canRetry).toBe(true)
  })

  it('copes with values that are not Error objects', () => {
    expect(describeRouteError('boom').title).toBe('Something went wrong')
    expect(describeRouteError(undefined).title).toBe('Something went wrong')
  })
})
