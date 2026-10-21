import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { QuizForm } from '../../../components/admin/QuizForm'
import { createQuestion, type QuizDraft } from '../../../components/admin/quizDraft'

function question(text: string) {
  const q = createQuestion()
  const [first, second] = q.options
  return {
    ...q,
    text,
    options: [
      { id: first?.id ?? 'o1', text: 'Yes' },
      { id: second?.id ?? 'o2', text: 'No' },
    ],
    correctOptionIds: [first?.id ?? 'o1'],
  }
}

const countries = [
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
]

function renderForm(
  questions = [question('First?'), question('Second?'), question('Third?')],
  overrides: Partial<QuizDraft> = {},
) {
  const initial: QuizDraft = {
    title: 'Quiz',
    description: '',
    countries: ['IN'],
    timeLimitSeconds: null,
    perQuestionSeconds: null,
    retakesAllowed: true,
    questions,
    ...overrides,
  }
  const onSubmit = vi.fn()
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <QuizForm initial={initial} countries={countries} submitLabel="Save" onSubmit={onSubmit} />
      ),
    },
    { path: '/admin', element: <p>Admin list</p> },
  ])
  render(<RouterProvider router={router} />)
  return { onSubmit }
}

const header = (number: number) =>
  screen.getByRole('button', { name: new RegExp(`^Question ${number}\\b`) })

describe('QuizForm question accordion', () => {
  it('opens the first question only', () => {
    renderForm()
    expect(header(1)).toHaveAttribute('aria-expanded', 'true')
    expect(header(2)).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('region', { name: /^Question \d/ })).toHaveLength(1)
  })

  it('keeps one question open at a time, and can close it', async () => {
    renderForm()
    await userEvent.click(header(2))
    expect(header(1)).toHaveAttribute('aria-expanded', 'false')
    expect(header(2)).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(header(2))
    expect(screen.queryByRole('region', { name: /^Question \d/ })).not.toBeInTheDocument()
  })

  it('summarises collapsed questions', () => {
    renderForm()
    expect(header(2)).toHaveTextContent('Second? · Single choice · 2 options')
  })

  it('opens a newly added question', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: '+ Add question' }))
    expect(header(4)).toHaveAttribute('aria-expanded', 'true')
    expect(header(1)).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the first invalid question when saving fails', async () => {
    const { onSubmit } = renderForm([question('Fine?'), question('')])
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(header(2)).toHaveAttribute('aria-expanded', 'true')
    expect(header(2)).toHaveTextContent('Needs fixing')
    const panel = screen.getByRole('region', { name: /Question 2/ })
    expect(within(panel).getByText('Question text is required.')).toBeInTheDocument()
    const text = within(panel).getByRole('textbox', { name: 'Question text' })
    await waitFor(() => expect(text).toHaveFocus())
  })

  it('offers a drag handle for every question instead of move buttons', () => {
    renderForm()
    expect(screen.getAllByRole('button', { name: /^Drag to reorder question/ })).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /Move question/ })).not.toBeInTheDocument()
  })

  describe('keyboard reordering', () => {
    const order = () =>
      screen
        .getAllByRole('button', { name: /^Question \d/ })
        .map((b) => /: (\w+)\?/.exec(b.textContent ?? '')?.[1] ?? 'open')

    it('previews the move and only commits it on drop', async () => {
      const { onSubmit } = renderForm()
      await userEvent.click(header(1)) // collapse, so every header shows its text
      screen.getByRole('button', { name: 'Drag to reorder question 1' }).focus()

      await userEvent.keyboard(' ')
      expect(screen.getByRole('button', { name: 'Drag to reorder question 1' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      expect(order()).toEqual(['Second', 'Third', 'First'])
      expect(screen.getByText('Position 3 of 3.')).toBeInTheDocument()
      // Focus follows the moving question.
      expect(screen.getByRole('button', { name: 'Drag to reorder question 3' })).toHaveFocus()

      await userEvent.keyboard(' ')
      expect(screen.getByText('Dropped question 1 at position 3.')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Save' }))
      const saved = onSubmit.mock.calls[0]?.[0] as QuizDraft
      expect(saved.questions.map((q) => q.text)).toEqual(['Second?', 'Third?', 'First?'])
    })

    it('leaves the order unchanged when the move is cancelled', async () => {
      const { onSubmit } = renderForm()
      await userEvent.click(header(1))
      screen.getByRole('button', { name: 'Drag to reorder question 1' }).focus()

      await userEvent.keyboard(' {ArrowDown}{Escape}')
      expect(order()).toEqual(['First', 'Second', 'Third'])
      expect(screen.getByText('Move cancelled. Question 1 stays where it was.')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Save' }))
      const saved = onSubmit.mock.calls[0]?.[0] as QuizDraft
      expect(saved.questions.map((q) => q.text)).toEqual(['First?', 'Second?', 'Third?'])
    })

    it('collapses questions while moving and reopens the open one after the drop', async () => {
      renderForm()
      expect(header(1)).toHaveAttribute('aria-expanded', 'true')
      screen.getByRole('button', { name: 'Drag to reorder question 1' }).focus()

      await userEvent.keyboard(' ')
      expect(screen.queryByRole('region', { name: /^Question \d/ })).not.toBeInTheDocument()
      await userEvent.keyboard('{ArrowDown} ')
      expect(header(2)).toHaveAttribute('aria-expanded', 'true')
    })
  })
})

describe('QuizForm validation', () => {
  const save = () => userEvent.click(screen.getByRole('button', { name: 'Save' }))

  it('focuses the first invalid field, starting with the details', async () => {
    renderForm([question('')], { title: ' ' })
    await save()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please fix the highlighted errors before saving (question 1).',
    )
    const title = screen.getByRole('textbox', { name: 'Title' })
    expect(title).toHaveFocus()
    expect(title).toBeInvalid()
    expect(title).toHaveAccessibleDescription('Title is required.')
  })

  it('requires at least one country', async () => {
    const { onSubmit } = renderForm(undefined, { countries: [] })
    await save()

    expect(onSubmit).not.toHaveBeenCalled()
    const india = screen.getByRole('button', { name: 'India' })
    expect(india).toHaveFocus()
    expect(screen.getByRole('toolbar', { name: /Assigned countries/ })).toHaveAccessibleDescription(
      'Assign at least one country.',
    )

    await userEvent.click(india)
    expect(screen.queryByText('Assign at least one country.')).not.toBeInTheDocument()
  })

  it('links option errors to the inputs they belong to', async () => {
    const empty = question('Pick one?')
    renderForm([
      {
        ...empty,
        options: [
          { id: 'a', text: 'Yes' },
          { id: 'b', text: ' ' },
        ],
      },
    ])
    await save()

    const option2 = screen.getByRole('textbox', { name: 'Option 2 text' })
    await waitFor(() => expect(option2).toHaveFocus())
    expect(option2).toHaveAccessibleDescription('Enter the option text.')
  })

  it('links the missing correct answer error to the answer inputs', async () => {
    renderForm([{ ...question('Pick one?'), correctOptionIds: [] }])
    await save()

    const correct = screen.getByRole('radio', { name: 'Option 1 is correct' })
    await waitFor(() => expect(correct).toHaveFocus())
    expect(screen.getByRole('radiogroup', { name: /Options/ })).toHaveAccessibleDescription(
      'Mark at least one correct option.',
    )
  })

  it('shows list-level errors for questions and options', async () => {
    renderForm([{ ...question('One option?'), options: [{ id: 'a', text: 'Only' }] }])
    await save()
    expect(screen.getByText('Add at least two options.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remove question' }))
    await save()
    expect(screen.getByText('Add at least one question.')).toBeInTheDocument()
  })

  it('saves trimmed values', async () => {
    const { onSubmit } = renderForm([question('Only?')], { title: '  Quiz  ' })
    await save()
    expect((onSubmit.mock.calls[0]?.[0] as QuizDraft).title).toBe('Quiz')
  })
})

describe('QuizForm unsaved changes', () => {
  it('asks before leaving with unsaved changes', async () => {
    renderForm()
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), '!')
    await userEvent.click(screen.getByRole('link', { name: 'Cancel' }))

    expect(screen.getByRole('heading', { name: 'Leave without saving?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))
    expect(screen.getByText('Admin list')).toBeInTheDocument()
  })

  it('leaves straight away when nothing changed', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('link', { name: 'Cancel' }))
    expect(screen.getByText('Admin list')).toBeInTheDocument()
  })
})
