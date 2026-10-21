import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_USER_ID, SESSION_STORAGE_KEY, useSessionStore } from '../../store/sessionStore'

function savedUserId(): unknown {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  return (JSON.parse(raw ?? '{}') as { state?: { userId?: unknown } }).state?.userId
}

/** Simulates opening the app again: a fresh store reads whatever localStorage holds. */
async function loadStoreWithSavedValue(saved: string) {
  localStorage.setItem(SESSION_STORAGE_KEY, saved)
  vi.resetModules()
  return import('../../store/sessionStore')
}

beforeEach(() => {
  localStorage.clear()
})

describe('the current user', () => {
  it('starts as the default user', () => {
    expect(useSessionStore.getState().userId).toBe(DEFAULT_USER_ID)
  })

  it('is saved when it changes', () => {
    useSessionStore.getState().setUserId('u3')

    expect(savedUserId()).toBe('u3')
  })

  it('is still the same user after the app is opened again', async () => {
    const { useSessionStore: reopened } = await loadStoreWithSavedValue(
      JSON.stringify({ state: { userId: 'u3' }, version: 1 }),
    )

    expect(reopened.getState().userId).toBe('u3')
  })

  it('does not save the actions, only the user id', () => {
    useSessionStore.getState().setUserId('u2')

    const saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? '{}') as {
      state: Record<string, unknown>
    }
    expect(Object.keys(saved.state)).toEqual(['userId'])
  })

  it.each([
    ['text that is not JSON', '{not valid json'],
    ['a state that is not an object', JSON.stringify({ state: 'oops', version: 1 })],
    ['a user id that is not a string', JSON.stringify({ state: { userId: 42 }, version: 1 })],
    ['an empty user id', JSON.stringify({ state: { userId: '' }, version: 1 })],
  ])('falls back to the default user for %s', async (_label, saved) => {
    const { useSessionStore: reopened } = await loadStoreWithSavedValue(saved)

    expect(reopened.getState().userId).toBe(DEFAULT_USER_ID)
  })
})
