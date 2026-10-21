import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Bump the suffix if the stored shape changes. */
export const SESSION_STORAGE_KEY = 'quiz-platform:session:v1'

export const DEFAULT_USER_ID = 'u1'

interface SessionState {
  /** Set by the user switcher (there is no real login). Remembered, so a reload keeps the same user. */
  userId: string
  setUserId: (userId: string) => void
}

function readSavedUserId(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const userId: unknown = Reflect.get(value, 'userId')
  return typeof userId === 'string' && userId !== '' ? userId : undefined
}

/**
 * Closing the tab and coming back has to resume the same person's attempt, so the current user is
 * saved in localStorage like the rest of the app's data.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      userId: DEFAULT_USER_ID,
      setUserId: (userId) => set({ userId }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: 1,
      partialize: ({ userId }) => ({ userId }),
      // Anything unreadable is ignored, so a corrupted value falls back to the default user.
      merge: (persisted, current) => ({
        ...current,
        userId: readSavedUserId(persisted) ?? current.userId,
      }),
    },
  ),
)
