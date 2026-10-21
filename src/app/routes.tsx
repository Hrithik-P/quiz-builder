import type { RouteObject } from 'react-router'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import { QuizAttendPage } from '../pages/QuizAttendPage'
import { QuizListPage } from '../pages/QuizListPage'
import { QuizStartPage } from '../pages/QuizStartPage'
import { ResultsPage } from '../pages/ResultsPage'
import { Layout, type RouteHandle } from './Layout'
import { RouteFallback } from './RouteFallback'

/**
 * The admin screens pull in the form, validation and drag-and-drop libraries, which quiz takers
 * never need, so each one is loaded the first time it is visited.
 */
const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    lazy: async () => ({
      Component: (await import('../pages/AdminQuizListPage')).AdminQuizListPage,
    }),
  },
  {
    path: 'admin/new',
    lazy: async () => ({ Component: (await import('../pages/QuizEditorPage')).QuizEditorPage }),
  },
  {
    path: 'admin/:quizId/edit',
    lazy: async () => ({ Component: (await import('../pages/QuizEditorPage')).QuizEditorPage }),
  },
]

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    HydrateFallback: RouteFallback,
    children: [
      { index: true, element: <QuizListPage /> },
      { path: 'quiz/:quizId', element: <QuizStartPage /> },
      {
        path: 'quiz/:quizId/attempt/:attemptId',
        element: <QuizAttendPage />,
        handle: { focusMode: true } satisfies RouteHandle,
      },
      { path: 'results/:attemptId', element: <ResultsPage /> },
      { path: 'leaderboard/:quizId?', element: <LeaderboardPage /> },
      ...adminRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
