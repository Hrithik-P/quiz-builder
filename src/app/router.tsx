import { createBrowserRouter } from 'react-router'
import { AdminQuizListPage } from '../pages/AdminQuizListPage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { QuizAttendPage } from '../pages/QuizAttendPage'
import { QuizEditorPage } from '../pages/QuizEditorPage'
import { QuizListPage } from '../pages/QuizListPage'
import { QuizStartPage } from '../pages/QuizStartPage'
import { ResultsPage } from '../pages/ResultsPage'
import { Layout, type RouteHandle } from './Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
      { path: 'admin', element: <AdminQuizListPage /> },
      { path: 'admin/new', element: <QuizEditorPage /> },
      { path: 'admin/:quizId/edit', element: <QuizEditorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
