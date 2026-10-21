import { Outlet, useMatches } from 'react-router'
import { LayoutGridIcon, PencilIcon, TrophyIcon } from 'lucide-react'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { UserSwitcher } from '../components/ui/UserSwitcher'
import { useQuizData } from '../store/quizStore'
import { useSessionStore } from '../store/sessionStore'
import { AppShell, type AreaLink, type NavItem, type ShellSurface } from './AppShell'

/** Route handle: hides the navigation (the attempt screen uses it). */
export interface RouteHandle {
  focusMode?: boolean
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Quizzes',
    Icon: LayoutGridIcon,
    isCurrent: (pathname) => pathname === '/',
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    Icon: TrophyIcon,
    isCurrent: (pathname) => pathname.startsWith('/leaderboard'),
  },
]

const adminLink: AreaLink = { to: '/admin', label: 'Admin', Icon: PencilIcon }

/** The user switcher is the only thing the learner area adds on top of the theme toggle. */
function LearnerControls({ surface }: { surface: ShellSurface }) {
  const userId = useSessionStore((state) => state.userId)
  const setUserId = useSessionStore((state) => state.setUserId)
  const { users } = useQuizData()
  const switcher = (
    <UserSwitcher users={users} userId={userId} onChange={setUserId} surface={surface} />
  )

  // On the panel the theme sits above the user; in the header the round theme button sits last.
  return surface === 'panel' ? (
    <>
      <ThemeToggle surface={surface} />
      {switcher}
    </>
  ) : (
    <>
      {switcher}
      <ThemeToggle surface={surface} />
    </>
  )
}

/** The quiz-taking area: quiz list, quizzes, results and the leaderboard. */
export function LearnerLayout() {
  const focusMode = useMatches().some(
    (match) => (match.handle as RouteHandle | undefined)?.focusMode,
  )

  return (
    <AppShell
      navLabel="Main"
      navItems={navItems}
      areaLink={adminLink}
      renderControls={(surface) => <LearnerControls surface={surface} />}
      focusMode={focusMode}
    >
      <Outlet />
    </AppShell>
  )
}
