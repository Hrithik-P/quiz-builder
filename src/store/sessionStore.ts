import { create } from 'zustand'

interface SessionState {
  /** Set by the user switcher (there is no real login). */
  userId: string
  setUserId: (userId: string) => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  userId: 'u1',
  setUserId: (userId) => set({ userId }),
}))
