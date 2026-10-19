import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { QuizListPage } from '../pages/QuizListPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { Placeholder } from '../pages/Placeholder'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <QuizListPage /> },
      { path: 'quiz/:quizId', element: <Placeholder title="Quiz start" /> },
      { path: 'quiz/:quizId/attempt/:attemptId', element: <Placeholder title="Quiz attend" /> },
      { path: 'results/:attemptId', element: <Placeholder title="Results" /> },
      { path: 'leaderboard/:quizId?', element: <Placeholder title="Leaderboard" /> },
      { path: 'admin', element: <Placeholder title="Quiz admin" /> },
      { path: 'admin/new', element: <Placeholder title="New quiz" /> },
      { path: 'admin/:quizId/edit', element: <Placeholder title="Edit quiz" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
