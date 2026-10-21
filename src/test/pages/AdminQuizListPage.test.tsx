import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_IMPORT_BYTES,
  QUIZ_FILE_FORMAT,
  QUIZ_FILE_VERSION,
} from '../../components/admin/quizTransfer'
import { AdminQuizListPage } from '../../pages/AdminQuizListPage'
import { useQuizStore } from '../../store/quizStore'
import { downloadTextFile } from '../../utils/downloadFile'

// Starting a real download is the browser's job, so replace it with a spy.
vi.mock('../../utils/downloadFile', () => ({ downloadTextFile: vi.fn() }))

const consoleError = vi.spyOn(console, 'error')

function renderPage() {
  render(
    <MemoryRouter>
      <AdminQuizListPage />
    </MemoryRouter>,
  )
}

function quizEntry(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Aardvark Facts',
    description: 'Imported in a test',
    countries: ['IN'],
    timeLimitSeconds: null,
    perQuestionSeconds: null,
    retakesAllowed: true,
    questions: [
      {
        id: 'question-1',
        text: 'Where do aardvarks live?',
        type: 'single',
        options: [
          { id: 'option-1', text: 'Africa' },
          { id: 'option-2', text: 'Iceland' },
        ],
        correctOptionIds: ['option-1'],
      },
    ],
    ...overrides,
  }
}

function jsonFile(content: unknown, name = 'quizzes.json') {
  const text = typeof content === 'string' ? content : JSON.stringify(content)
  return new File([text], name, { type: 'application/json' })
}

function quizFile(...quizzes: unknown[]) {
  return jsonFile({ format: QUIZ_FILE_FORMAT, version: QUIZ_FILE_VERSION, quizzes })
}

async function chooseFile(user: ReturnType<typeof userEvent.setup>, file: File) {
  await user.upload(screen.getByLabelText('Quiz file to import'), file)
}

beforeEach(() => {
  vi.mocked(downloadTextFile).mockClear()
  consoleError.mockImplementation(() => undefined)
})

afterEach(() => {
  consoleError.mockReset()
})

describe('importing quizzes', () => {
  it('adds the quizzes from a valid file and says how many', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseFile(user, quizFile(quizEntry()))

    expect(await screen.findByRole('status')).toHaveTextContent('Imported 1 quiz.')
    expect(screen.getByRole('heading', { name: 'Aardvark Facts', level: 2 })).toBeInTheDocument()
    expect(useQuizStore.getState().quizzes).toHaveLength(6)
  })

  it('adds every quiz in a file that holds several', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseFile(user, quizFile(quizEntry(), quizEntry({ title: 'Badger Facts' })))

    expect(await screen.findByRole('status')).toHaveTextContent('Imported 2 quizzes.')
    expect(useQuizStore.getState().quizzes).toHaveLength(7)
  })

  it('imports nothing and lists the problems when the file has errors', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseFile(user, quizFile(quizEntry(), quizEntry({ title: 'Broken', countries: [] })))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('The file was not imported. Nothing was changed.')
    expect(
      within(alert).getByText(/Quiz 2 \(“Broken”\), countries: Assign at least one country/),
    ).toBeInTheDocument()
    expect(useQuizStore.getState().quizzes).toHaveLength(5)
  })

  it('rejects a file that is not JSON', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseFile(user, jsonFile('this is not json'))

    expect(await screen.findByRole('alert')).toHaveTextContent('This file is not valid JSON.')
    expect(useQuizStore.getState().quizzes).toHaveLength(5)
  })

  it('rejects a file that is too large without reading it', async () => {
    const user = userEvent.setup()
    renderPage()

    await chooseFile(user, jsonFile('x'.repeat(MAX_IMPORT_BYTES + 1), 'huge.json'))

    expect(await screen.findByRole('alert')).toHaveTextContent('The file is larger than 1 MB.')
    expect(useQuizStore.getState().quizzes).toHaveLength(5)
  })

  it('reports a failed save instead of crashing', async () => {
    const user = userEvent.setup()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    try {
      renderPage()

      await chooseFile(user, quizFile(quizEntry()))

      expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved')
      expect(consoleError).toHaveBeenCalled()
    } finally {
      setItem.mockRestore()
    }
  })

  it('clears the message when it is dismissed', async () => {
    const user = userEvent.setup()
    renderPage()
    await chooseFile(user, jsonFile('nope'))
    await screen.findByRole('alert')

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('goes back to the first page so the new quizzes can be found', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.queryByRole('heading', { name: 'General Science' })).not.toBeInTheDocument()

    await chooseFile(user, quizFile(quizEntry()))

    expect(await screen.findByRole('heading', { name: 'Aardvark Facts' })).toBeInTheDocument()
  })
})

describe('exporting quizzes', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-21T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('downloads every quiz as a dated JSON file', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Export all quizzes' }))

    expect(downloadTextFile).toHaveBeenCalledTimes(1)
    const [filename, text, mimeType] = vi.mocked(downloadTextFile).mock.calls[0] ?? []
    expect(filename).toBe('quizzes-2026-10-21.json')
    expect(mimeType).toBe('application/json')
    const file = JSON.parse(text ?? '{}') as { quizzes: unknown[]; format: string }
    expect(file.format).toBe(QUIZ_FILE_FORMAT)
    expect(file.quizzes).toHaveLength(5)
  })

  it('cannot be used when there are no quizzes', () => {
    act(() => useQuizStore.setState({ quizzes: [] }))
    renderPage()

    expect(screen.getByRole('button', { name: 'Export all quizzes' })).toBeDisabled()
  })

  it('writes a file that importing reads back as copies of the same quizzes', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Export all quizzes' }))
    const exported = vi.mocked(downloadTextFile).mock.calls[0]?.[1] ?? ''

    await chooseFile(user, jsonFile(exported))

    expect(await screen.findByRole('status')).toHaveTextContent('Imported 5 quizzes.')
    const titles = useQuizStore.getState().quizzes.map((quiz) => quiz.title)
    expect(titles).toHaveLength(10)
    expect(titles.filter((title) => title === 'JavaScript Basics')).toHaveLength(2)
  })
})
