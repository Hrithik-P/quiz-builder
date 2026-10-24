import type { ComponentType, ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useApplyTheme } from '../hooks/useApplyTheme'
import { useQuizStore } from '../store/quizStore'
import { useSessionStore } from '../store/sessionStore'

/** Where the controls are drawn: a light header on phones, the dark side panel on desktop. */
export type ShellSurface = 'light' | 'panel'

type ShellIcon = ComponentType<{ size?: number }>

export interface NavItem {
  to: string
  label: string
  Icon: ShellIcon
  /** True when the current path belongs to this item, so it is highlighted. */
  isCurrent: (pathname: string) => boolean
}

export interface AreaLink {
  to: string
  label: string
  Icon: ShellIcon
}

interface AppShellProps {
  /** Names the navigation landmark, e.g. "Main". */
  navLabel: string
  navItems: NavItem[]
  /** Takes the user to the other area of the app. */
  areaLink: AreaLink
  /** Controls such as the theme toggle. Called once per surface, because each is styled differently. */
  renderControls: (surface: ShellSurface) => ReactNode
  /** Full-screen content with no navigation, such as the attempt screen. */
  focusMode?: boolean
  children: ReactNode
}

function Brand({ onPanel = false }: { onPanel?: boolean }) {
  return (
    <span className="font-display text-2xl font-extrabold tracking-tight">
      Pop<span className={onPanel ? 'text-tile-5' : 'text-accent'}>Quiz</span>
    </span>
  )
}

/**
 * The frame around every screen: skip link, header, navigation and the main area. The learner and
 * admin areas both use it and only differ in what they pass in, so they always look the same.
 */
export function AppShell({
  navLabel,
  navItems,
  areaLink,
  renderControls,
  focusMode = false,
  children,
}: AppShellProps) {
  useApplyTheme()
  // "/admin/" and "/admin" are the same page.
  const currentPath = useLocation().pathname.replace(/(.)\/$/, '$1')
  const AreaIcon = areaLink.Icon
  const userId = useSessionStore((state) => state.userId)
  const isAdmin = useQuizStore(
    (state) => state.users.find((user) => user.id === userId)?.role === 'admin',
  )

  return (
    <div className="min-h-dvh lg:flex lg:gap-6 lg:p-6">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      {!focusMode && (
        <>
          <header className="flex items-center justify-between gap-3 px-4 pt-4 lg:hidden">
            <span className="hidden min-[400px]:inline">
              <Brand />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <Link
                to={areaLink.to}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-edge bg-surface px-3 text-sm font-bold no-underline shadow-pop-sm"
              >
                <AreaIcon size={16} />
                {areaLink.label}
              </Link>
              {renderControls('light')}
            </div>
          </header>

          <nav
            aria-label={navLabel}
            style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
            className="fixed inset-x-3 bottom-3 z-40 grid gap-1.5 rounded-3xl bg-panel p-1.5 shadow-pop lg:sticky lg:top-6 lg:flex lg:h-[calc(100dvh-3rem)] lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1.5 lg:p-4 lg:shadow-none"
          >
            <span className="hidden px-2 pt-2 pb-6 text-panel-fg lg:block">
              <Brand onPanel />
            </span>
            {navItems.map(({ to, label, Icon, isCurrent }) => {
              const isActive = isCurrent(currentPath)
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-semibold no-underline lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-3.5 lg:text-[0.95rem] ${
                    isActive
                      ? 'bg-surface font-bold text-fg dark:bg-accent dark:text-accent-fg'
                      : 'text-panel-muted hover:bg-white/10 hover:text-panel-fg'
                  }`}
                >
                  <Icon />
                  {label}
                </Link>
              )
            })}
            <div className="mt-auto hidden flex-col gap-2 lg:flex">
            {isAdmin && 
              <Link
                to={areaLink.to}
                className="inline-flex min-h-11 items-center gap-3 rounded-2xl px-3.5 font-semibold text-panel-muted no-underline hover:bg-white/10 hover:text-panel-fg"
              >
                <AreaIcon size={18} />
                {areaLink.label}
              </Link>
            }
              {renderControls('panel')}
            </div>
          </nav>
        </>
      )}

      <main
        id="main"
        className={
          focusMode
            ? 'min-w-0 flex-1'
            : 'mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 pt-5 pb-28 lg:px-2 lg:pt-2 lg:pb-6'
        }
      >
        {children}
      </main>
    </div>
  )
}
