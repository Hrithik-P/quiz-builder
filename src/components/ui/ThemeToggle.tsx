import type { ReactNode } from 'react'
import { useThemeStore, type ThemePreference } from '../../store/themeStore'

const order: ThemePreference[] = ['system', 'light', 'dark']

const labels: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const icons: Record<ThemePreference, ReactNode> = {
  system: (
    <svg {...iconProps}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  light: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg {...iconProps}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
}

/** Cycles System → Light → Dark. */
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
