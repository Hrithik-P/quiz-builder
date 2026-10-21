import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RouteErrorPage } from '../../app/RouteErrorPage'
import { routes } from '../../app/routes'

// A screen that crashes while rendering, standing in for any bug in a page.
vi.mock('../../pages/ResultsPage', () => ({
  ResultsPage: () => {
    throw new Error('secret internal failure')
  },
}))

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  // React and React Router log caught errors; keep the output clean and check it was logged.
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  consoleError.mockRestore()
})

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('a screen that crashes', () => {
  it('shows a friendly message instead of a blank page', async () => {
    renderApp('/results/a1')

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('does not show the raw error to the user, but still logs it', async () => {
    renderApp('/results/a1')

    await screen.findByRole('alert')
    expect(screen.queryByText(/secret internal failure/)).not.toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith('Route error:', expect.any(Error))
  })

  it('keeps the app navigation working', async () => {
    const user = userEvent.setup()
    const router = renderApp('/results/a1')

    await screen.findByRole('alert')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Back to quizzes' }))
    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByRole('heading', { name: 'Pick your next quiz' })).toBeInTheDocument()
  })

  it('recovers once the user navigates to a healthy page', async () => {
    const user = userEvent.setup()
    renderApp('/results/a1')
    await screen.findByRole('alert')

    await user.click(screen.getByRole('link', { name: 'Leaderboard' }))

    expect(await screen.findByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('a page that fails to download', () => {
  it('explains the problem and offers a retry', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          ErrorBoundary: RouteErrorPage,
          lazy: () =>
            Promise.reject(new TypeError('Failed to fetch dynamically imported module: /a.js')),
        },
      ],
      { initialEntries: ['/admin'] },
    )
    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this page')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})

describe('lazy-loaded admin pages', () => {
  it('load on demand and render inside the app shell', async () => {
    renderApp('/admin')

    expect(await screen.findByRole('heading', { name: 'Manage quizzes' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument()
  })
})
