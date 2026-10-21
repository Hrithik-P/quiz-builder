import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '../../app/routes'

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

/** The navigation lists "Quizzes" and "Leaderboard" for learners, "Manage quizzes" for admins. */
function currentLinkNames(nav: HTMLElement): string[] {
  return within(nav)
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent ?? '')
}

const userSwitcher = { name: /Current user/ }

describe('learner area', () => {
  it('shows the quiz navigation, the user switcher and a link to the admin area', async () => {
    renderApp('/')

    const nav = await screen.findByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Quizzes' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Leaderboard' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Admin' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Manage quizzes' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('combobox', userSwitcher).length).toBeGreaterThan(0)
  })

  it.each([
    ['/', ['Quizzes']],
    ['/leaderboard', ['Leaderboard']],
    ['/leaderboard/q1', ['Leaderboard']],
    ['/quiz/q1', []],
  ])('highlights the current page at %s', async (path, expected) => {
    renderApp(path)

    const nav = await screen.findByRole('navigation', { name: 'Main' })
    expect(currentLinkNames(nav)).toEqual(expected)
  })

  it('has no navigation on the attempt screen, so the quiz fills the page', async () => {
    renderApp('/quiz/q1/attempt/missing')

    expect(await screen.findByRole('main')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('shows a missing page inside the shell', async () => {
    renderApp('/nowhere')

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })
})

describe('admin area', () => {
  it('shows the admin navigation and a way back, and no user switcher', async () => {
    renderApp('/admin')

    const nav = await screen.findByRole('navigation', { name: 'Admin' })
    expect(within(nav).getByRole('link', { name: 'Manage quizzes' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'New quiz' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Back to quizzes' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', userSwitcher)).not.toBeInTheDocument()
  })

  it.each([
    ['/admin', ['Manage quizzes']],
    ['/admin/', ['Manage quizzes']],
    ['/admin/new', ['New quiz']],
    ['/admin/q1/edit', ['Manage quizzes']],
  ])('highlights the current page at %s', async (path, expected) => {
    renderApp(path)

    const nav = await screen.findByRole('navigation', { name: 'Admin' })
    expect(currentLinkNames(nav)).toEqual(expected)
  })

  it('shows a missing admin page inside the admin shell', async () => {
    renderApp('/admin/nowhere')

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument()
  })
})

describe('moving between the areas', () => {
  it('goes from the learner area to the admin area and back', async () => {
    const user = userEvent.setup()
    const router = renderApp('/')

    const learnerNav = await screen.findByRole('navigation', { name: 'Main' })
    await user.click(within(learnerNav).getByRole('link', { name: 'Admin' }))
    expect(await screen.findByRole('heading', { name: 'Manage quizzes' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/admin')

    const adminNav = screen.getByRole('navigation', { name: 'Admin' })
    await user.click(within(adminNav).getByRole('link', { name: 'Back to quizzes' }))
    expect(await screen.findByRole('heading', { name: 'Pick your next quiz' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('goes from the admin list to the new quiz form with the admin navigation', async () => {
    const user = userEvent.setup()
    renderApp('/admin')

    const nav = await screen.findByRole('navigation', { name: 'Admin' })
    await user.click(within(nav).getByRole('link', { name: 'New quiz' }))

    expect(await screen.findByRole('heading', { name: 'New quiz', level: 1 })).toBeInTheDocument()
    expect(currentLinkNames(screen.getByRole('navigation', { name: 'Admin' }))).toEqual([
      'New quiz',
    ])
  })
})

describe('one shell for both areas', () => {
  it.each(['/', '/admin'])('has the skip link, main area and theme toggle at %s', async (path) => {
    renderApp(path)

    expect(await screen.findByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#main',
    )
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
    expect(screen.getAllByRole('button', { name: /^Theme:/ }).length).toBeGreaterThan(0)
  })
})
