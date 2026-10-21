import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export function useApplyTheme() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
  }, [theme])
}
