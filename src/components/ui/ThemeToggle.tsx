import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useThemeStore, type ThemePreference } from '../../store/themeStore'

const order: ThemePreference[] = ['system', 'light', 'dark']

const labels: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

const icons: Record<ThemePreference, ReactNode> = {
  system: <MonitorIcon size={18} />,
  light: <SunIcon size={18} />,
  dark: <MoonIcon size={18} />,
}

export function ThemeToggle({ surface = 'light' }: { surface?: 'light' | 'panel' }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const next = order[(order.indexOf(theme) + 1) % order.length] ?? 'system'

  return (
    <button
      type="button"
      className={
        surface === 'panel'
          ? 'inline-flex min-h-11 items-center gap-3 rounded-2xl px-3.5 font-semibold text-panel-muted hover:bg-white/10 hover:text-panel-fg'
          : 'inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-edge bg-surface shadow-pop-sm transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-pop active:translate-y-0.5 active:shadow-none'
      }
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${labels[theme]}. Switch to ${labels[next].toLowerCase()}`}
      title={`Theme: ${labels[theme]}`}
    >
      {icons[theme]}
      {surface === 'panel' && <span>Theme: {labels[theme]}</span>}
    </button>
  )
}
