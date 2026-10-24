import { Navigate, Outlet } from 'react-router'
import { ArrowLeftIcon, ListChecksIcon, PlusIcon } from 'lucide-react'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { AppShell, type AreaLink, type NavItem } from './AppShell'
import { useQuizStore } from '../store/quizStore'
import { useSessionStore } from '../store/sessionStore'

const navItems: NavItem[] = [
  {
    to: '/admin',
    label: 'Manage quizzes',
    Icon: ListChecksIcon,
    // Editing a quiz is still "managing" it.
    isCurrent: (pathname) => pathname === '/admin' || /^\/admin\/[^/]+\/edit$/.test(pathname),
  },
  {
    to: '/admin/new',
    label: 'New quiz',
    Icon: PlusIcon,
    isCurrent: (pathname) => pathname === '/admin/new',
  },
]

const learnerLink: AreaLink = { to: '/', label: 'Back to quizzes', Icon: ArrowLeftIcon }

/** The admin area. Admin actions do not depend on the current user, so there is no user switcher. */
export function AdminLayout() {
  const userId = useSessionStore((state) => state.userId)
  const isAuthorized = useQuizStore(
    (state) => state.users.find((user) => user.id === userId)?.role === 'admin',
  )

  if (!isAuthorized) {
    return <Navigate to="/" replace />
  }
  return (
    <AppShell
      navLabel="Admin"
      navItems={navItems}
      areaLink={learnerLink}
      renderControls={(surface) => <ThemeToggle surface={surface} />}
    >
      
      <Outlet />
    </AppShell>
  )
}
