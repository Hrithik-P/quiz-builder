import type { ComponentType } from 'react'
import { NavLink, Outlet, useMatches } from 'react-router'
import { GridIcon, PencilIcon, PodiumIcon } from '../components/ui/icons'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { UserSwitcher } from '../components/ui/UserSwitcher'
import { useApplyTheme } from '../hooks/useApplyTheme'
import { quizService } from '../services/quizService'
import { useSessionStore } from '../store/sessionStore'

/** Route `handle` flag: hide the app navigation so the attempt screen has the whole viewport. */
export interface RouteHandle {
  focusMode?: boolean
}

interface NavItem {
  to: string
  label: string
  Icon: ComponentType<{ size?: number }>
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Quizzes', Icon: GridIcon, end: true },
  { to: '/leaderboard', label: 'Leaderboard', Icon: PodiumIcon },
  { to: '/admin', label: 'Admin', Icon: PencilIcon },
]

function Brand({ onPanel = false }: { onPanel?: boolean }) {
  return (
    <span className="font-display text-2xl font-extrabold tracking-tight">
      Pop<span className={onPanel ? 'text-tile-5' : 'text-accent'}>Quiz</span>
    </span>
  )
}

export function Layout() {
  const userId = useSessionStore((s) => s.userId)
  const setUserId = useSessionStore((s) => s.setUserId)
  const users = quizService.getUsers()
  const focusMode = useMatches().some((m) => (m.handle as RouteHandle | undefined)?.focusMode)
  useApplyTheme()

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
          {/* Phones and tablets: brand, user and theme on top; navigation docked at the bottom. */}
          <header className="flex items-center justify-between gap-3 px-4 pt-4 lg:hidden">
            <span className="hidden min-[400px]:inline">
              <Brand />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <UserSwitcher users={users} userId={userId} onChange={setUserId} />
              <ThemeToggle />
            </div>
          </header>

          <nav
            aria-label="Main"
            className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 gap-1.5 rounded-3xl bg-panel p-1.5 shadow-pop lg:sticky lg:top-6 lg:flex lg:h-[calc(100dvh-3rem)] lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1.5 lg:p-4 lg:shadow-none"
          >
            <span className="hidden px-2 pt-2 pb-6 text-panel-fg lg:block">
              <Brand onPanel />
            </span>
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-semibold no-underline lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-3.5 lg:text-[0.95rem] ${
                    isActive
                      ? 'bg-surface font-bold text-fg dark:bg-accent dark:text-accent-fg'
                      : 'text-panel-muted hover:bg-white/10 hover:text-panel-fg'
                  }`
                }
              >
                <Icon />
                {label}
              </NavLink>
            ))}
            <div className="mt-auto hidden flex-col gap-2 lg:flex">
              <ThemeToggle surface="panel" />
              <UserSwitcher users={users} userId={userId} onChange={setUserId} surface="panel" />
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
        <Outlet />
      </main>
    </div>
  )
}
