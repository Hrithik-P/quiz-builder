import type { RouteObject } from 'react-router'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import { QuizAttendPage } from '../pages/QuizAttendPage'
import { QuizListPage } from '../pages/QuizListPage'
import { QuizStartPage } from '../pages/QuizStartPage'
import { ResultsPage } from '../pages/ResultsPage'
import { LearnerLayout, type RouteHandle } from './LearnerLayout'
import { RouteErrorPage } from './RouteErrorPage'
import { RouteFallback } from './RouteFallback'

/**
 * The admin area is loaded as a whole, the first time it is visited: its shell and screens pull in
 * the form, validation and drag-and-drop libraries, which quiz takers never need.
 */
const adminArea: RouteObject = {
  path: '/admin',
  lazy: async () => ({ Component: (await import('./AdminLayout')).AdminLayout }),
  HydrateFallback: RouteFallback,
  ErrorBoundary: RouteErrorPage,
  children: [
    {
      ErrorBoundary: RouteErrorPage,
      children: [
        {
          index: true,
          lazy: async () => ({
            Component: (await import('../pages/AdminQuizListPage')).AdminQuizListPage,
          }),
        },
        {
          path: 'new',
          lazy: async () => ({
            Component: (await import('../pages/QuizEditorPage')).QuizEditorPage,
          }),
        },
        {
          path: ':quizId/edit',
          lazy: async () => ({
            Component: (await import('../pages/QuizEditorPage')).QuizEditorPage,
          }),
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
}

/**
 * Two areas, each with two error boundaries. The inner boundary wraps the screens, so a crash there
 * is shown inside the app shell and the navigation keeps working. The outer one catches a failure
 * in the shell itself.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LearnerLayout />,
    HydrateFallback: RouteFallback,
    ErrorBoundary: RouteErrorPage,
    children: [
      {
        ErrorBoundary: RouteErrorPage,
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
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  adminArea,
]
