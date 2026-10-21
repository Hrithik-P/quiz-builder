import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'system' | 'light' | 'dark'

/** index.html reads this key too, to apply the theme before first paint. */
export const THEME_STORAGE_KEY = 'quiz-theme'

interface ThemeState {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: THEME_STORAGE_KEY },
  ),
)
