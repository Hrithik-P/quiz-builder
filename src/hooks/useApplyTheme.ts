import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

/** Mirrors the theme preference onto <html data-theme>, which the CSS tokens key off. */
export function useApplyTheme() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
  }, [theme])
}
