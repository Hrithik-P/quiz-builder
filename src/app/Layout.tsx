import { NavLink, Outlet } from 'react-router'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2 py-1 font-medium no-underline hover:bg-line/50 ${
    isActive ? 'text-accent' : 'text-fg'
  }`

export function Layout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-10 focus:bg-bg focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-surface">
        <nav aria-label="Main" className="mx-auto flex max-w-5xl gap-2 px-4 py-3">
          <NavLink to="/" end className={navLinkClass}>
            Quizzes
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>
            Leaderboard
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </>
  )
}
