import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

interface SeedQuestion {
  id: string
  text: string
  type: 'single' | 'multiple'
  options: { id: string; text: string }[]
  correctOptionIds: string[]
}

interface SeedQuiz {
  id: string
  title: string
  questions: SeedQuestion[]
}

// The tests read the correct answers from the seed, the same file the app starts from. Each
// Playwright test gets a fresh browser, so the app always starts on exactly this data.
const seed = JSON.parse(
  readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8'),
) as { quizzes: SeedQuiz[] }

function getQuiz(quizId: string): SeedQuiz {
  const quiz = seed.quizzes.find((candidate) => candidate.id === quizId)
  if (!quiz) throw new Error(`Seed quiz ${quizId} is missing`)
  return quiz
}

async function selectCorrectOptions(page: Page, question: SeedQuestion) {
  const role = question.type === 'single' ? 'radio' : 'checkbox'
  for (const optionId of question.correctOptionIds) {
    const option = question.options.find((candidate) => candidate.id === optionId)
    if (!option) throw new Error(`Option ${optionId} is missing`)
    // The input is visually hidden behind its card, so click the card like a user would.
    const input = page.getByRole(role, { name: option.text, exact: true })
    await page.locator('label').filter({ has: input }).click()
    await expect(input).toBeChecked()
  }
}

test('takes a quiz from the list to the leaderboard, and resumes after a reload', async ({
  page,
}) => {
  const quiz = getQuiz('q1')
  const total = quiz.questions.length

  // Quiz list -> start screen.
  await page.goto('/')
  await page.getByRole('link', { name: quiz.title }).click()
  await expect(page.getByRole('heading', { name: quiz.title, level: 1 })).toBeVisible()
  await page.getByRole('link', { name: 'Start quiz' }).click()

  for (const [index, question] of quiz.questions.entries()) {
    await expect(page.getByText(`Question ${index + 1} of ${total}`)).toBeVisible()
    // Focus moves to the new question, so keyboard and screen-reader users land on it.
    await expect(page.getByRole('heading', { name: question.text })).toBeFocused()

    if (index === 2) {
      await page.reload()
      await expect(page.getByText(`Question 3 of ${total}`)).toBeVisible()
      await expect(page.getByRole('heading', { name: question.text })).toBeVisible()
      await expect(page.getByText(/Quiz time: .* remaining/)).toBeAttached()
    }

    await selectCorrectOptions(page, question)
    await page.keyboard.press('Enter')
  }

  // Results.
  await expect(page).toHaveURL(/\/results\//)
  await expect(page.getByText(`You scored ${total} out of ${total}`)).toBeVisible()
  await expect(page.getByText('100%').first()).toBeVisible()

  // Leaderboard: the current user is on it and highlighted.
  await page.getByRole('link', { name: 'Full leaderboard' }).click()
  await expect(page).toHaveURL(/\/leaderboard\/q1/)
  // The page renders a table and stacked cards and hides one with CSS, so count visible matches.
  const board = page.getByRole('main')
  await expect(board.getByText('Aarav Menon').filter({ visible: true })).toHaveCount(1)
  await expect(board.getByText('· you').filter({ visible: true })).toHaveCount(1)

  // The quiz list reflects the new attempt without any reload.
  await page.getByRole('link', { name: 'Quizzes' }).click()
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('link', { name: quiz.title }) })
  await expect(card).toContainText('100%')
})

test('shows the prior result instead of the start screen when retakes are not allowed', async ({
  page,
}) => {
  await page.goto('/quiz/q2')

  await expect(page.getByText('You have already completed this quiz')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start quiz' })).toHaveCount(0)
})

test('completes the seed attempt whose time limit has already run out', async ({ page }) => {
  await page.goto('/quiz/q3')
  await page.getByRole('link', { name: 'Resume quiz' }).click()

  await expect(page).toHaveURL(/\/results\/a11/)
  await expect(page.getByText(/You scored \d out of 5/)).toBeVisible()
})
