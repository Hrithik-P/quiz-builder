import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QuizAttendPage } from '../../pages/QuizAttendPage'
import { getBestResult, getInProgressAttempt } from '../../services/quizQueries'
import { useQuizStore } from '../../store/quizStore'
import { useSessionStore } from '../../store/sessionStore'

const NOW = '2026-10-21T10:00:00Z'

function renderAttempt(attemptId: string, quizId: string) {
  return render(
    <MemoryRouter initialEntries={[`/quiz/${quizId}/attempt/${attemptId}`]}>
      <Routes>
        <Route path="/quiz/:quizId/attempt/:attemptId" element={<QuizAttendPage />} />
        <Route path="/quiz/:quizId" element={<p>Quiz start page</p>} />
        <Route path="/results/:attemptId" element={<p>Results page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function setUser(userId: string) {
  act(() => useSessionStore.setState({ userId }))
}

function advance(seconds: number) {
  act(() => vi.advanceTimersByTime(seconds * 1000))
}

function setup() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
}

/** The first option of the current question, whether it is a radio or a checkbox. */
function firstOption(): HTMLElement {
  const option = screen.queryAllByRole('radio')[0] ?? screen.getAllByRole('checkbox')[0]
  if (!option) throw new Error('No option is shown')
  return option
}

function store() {
  return useQuizStore.getState()
}

function firstOptionId(quizId: string, questionIndex = 0): string {
  const quiz = store().quizzes.find((candidate) => candidate.id === quizId)
  return quiz?.questions[questionIndex]?.options[0]?.id ?? ''
}

function startAttempt(quizId: string, userId: string) {
  const result = store().startOrResumeAttempt(quizId, userId)
  if (!result.ok) throw new Error(`Could not start: ${result.reason}`)
  return result.attempt
}

function inProgressAttempt(quizId: string, userId: string) {
  return getInProgressAttempt(store(), quizId, userId)
}

beforeEach(() => {
  // Testing Library only drives fake timers under Jest, so let the fake clock follow real time too.
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(NOW))
})

afterEach(() => {
  vi.useRealTimers()
  act(() => useSessionStore.setState({ userId: 'u1' }))
})

describe('answering', () => {
  it('starts an attempt and shows the first question with progress', () => {
    setUser('u5')
    renderAttempt('new', 'q1')

    expect(screen.getByText('Question 1 of 6')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveFocus()
    expect(screen.getByRole('button', { name: /lock it in/i })).toBeDisabled()
  })

  it('selects with the keyboard and submits with Enter, then moves to the next question', async () => {
    const user = setup()
    setUser('u5')
    renderAttempt('new', 'q1')

    await user.tab()
    await user.keyboard(' ')
    expect(screen.getAllByRole('radio')[0]).toBeChecked()
    await user.keyboard('{Enter}')

    expect(screen.getByText('Question 2 of 6')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveFocus()
    expect(screen.getAllByRole('radio')[0]).not.toBeChecked()
  })

  it('records a single answer when the submit button is clicked repeatedly', async () => {
    const user = setup()
    setUser('u5')
    renderAttempt('new', 'q1')

    await user.click(firstOption())
    await user.dblClick(screen.getByRole('button', { name: /lock it in/i }))

    expect(inProgressAttempt('q1', 'u5')?.answers).toHaveLength(1)
  })

  it('completes the quiz after the last answer and shows the results', async () => {
    const user = setup()
    setUser('u5')
    renderAttempt('new', 'q4')

    for (let question = 1; question <= 5; question += 1) {
      await user.click(firstOption())
      await user.click(screen.getByRole('button', { name: /lock it in|finish quiz/i }))
    }

    expect(screen.getByText('Results page')).toBeInTheDocument()
  })

  it('sends the user to the quiz page when a retake is not allowed', () => {
    setUser('u1')
    renderAttempt('new', 'q2')

    expect(screen.getByText('Quiz start page')).toBeInTheDocument()
  })
})

describe('timeout', () => {
  it('submits the selected answer and moves on when the question timer runs out', async () => {
    const user = setup()
    setUser('u2')
    renderAttempt('new', 'q2')

    await user.click(firstOption())
    advance(31)

    expect(screen.getByText('Question 2 of 7')).toBeInTheDocument()
    const [answer] = inProgressAttempt('q2', 'u2')?.answers ?? []
    expect(answer?.selectedOptionIds).toEqual([firstOptionId('q2')])
  })

  it('moves on with no answer when nothing was selected', () => {
    setUser('u2')
    renderAttempt('new', 'q2')

    advance(31)

    expect(screen.getByText('Question 2 of 7')).toBeInTheDocument()
    const [answer] = inProgressAttempt('q2', 'u2')?.answers ?? []
    expect(answer).toMatchObject({ selectedOptionIds: [], isCorrect: false })
  })

  it('completes the quiz when the overall time runs out', () => {
    setUser('u1')
    renderAttempt('new', 'q4')

    advance(181)

    expect(screen.getByText('Results page')).toBeInTheDocument()
    expect(getBestResult(store(), 'q4', 'u1')).toMatchObject({ score: 0, timeTakenSeconds: 180 })
  })
})

describe('resume', () => {
  it('returns to the right question with the right remaining time, counting time away', () => {
    setUser('u5')
    const attempt = startAttempt('q1', 'u5')
    const answerFirstOption = (questionIndex: number) => {
      const question = store().quizzes.find((quiz) => quiz.id === 'q1')?.questions[questionIndex]
      store().submitAnswer(attempt.id, question?.id ?? '', [firstOptionId('q1', questionIndex)])
    }
    advance(5)
    answerFirstOption(0)
    advance(5)
    answerFirstOption(1)

    // The user closes the tab for 30 seconds, then comes back.
    advance(30)
    renderAttempt(attempt.id, 'q1')

    expect(screen.getByText('Question 3 of 6')).toBeInTheDocument()
    expect(screen.getByText('Quiz time: 4:20 remaining')).toBeInTheDocument()
  })

  it('resumes the same attempt after a reload', () => {
    setUser('u5')
    const first = renderAttempt('new', 'q1')
    const attempt = inProgressAttempt('q1', 'u5')
    first.unmount()

    renderAttempt(attempt?.id ?? '', 'q1')

    expect(screen.getByText('Question 1 of 6')).toBeInTheDocument()
  })

  it('moves past questions that expired while the user was away', () => {
    setUser('u2')
    const attempt = startAttempt('q2', 'u2')
    advance(100)

    renderAttempt(attempt.id, 'q2')

    expect(screen.getByText('Question 4 of 7')).toBeInTheDocument()
  })
})

describe('quiz changed during an attempt', () => {
  it('says so when the quiz was deleted', () => {
    setUser('u5')
    const attempt = startAttempt('q1', 'u5')
    store().deleteQuiz('q1')

    renderAttempt(attempt.id, 'q1')

    expect(screen.getByText('This quiz was deleted')).toBeInTheDocument()
  })

  it('says so when the questions were edited', () => {
    setUser('u5')
    const attempt = startAttempt('q1', 'u5')
    const quiz = store().quizzes.find((candidate) => candidate.id === 'q1')
    if (!quiz) throw new Error('Seed quiz q1 is missing')
    const { questions, ...rest } = quiz
    store().updateQuiz('q1', {
      ...rest,
      questions: questions.map((question) => ({ ...question, text: `${question.text} (edited)` })),
    })

    renderAttempt(attempt.id, 'q1')

    expect(screen.getByText('This quiz was changed')).toBeInTheDocument()
  })

  it('shows not found for an attempt that does not exist', () => {
    renderAttempt('missing', 'q1')
    expect(screen.getByText('Quiz not found')).toBeInTheDocument()
  })
})
