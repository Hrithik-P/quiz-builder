import { expect, test, type Page } from '@playwright/test'

// One unbroken word has no place to wrap, so it is the worst case for a narrow screen. Real quiz
// text can contain one too (a long link, a pasted identifier), and imported files can hold anything.
const LONG_TITLE = 'T'.repeat(240)
const LONG_QUESTION = 'Q'.repeat(300)
const LONG_OPTION = 'A'.repeat(200)

const quizFile = {
  format: 'quiz-platform/quizzes',
  version: 1,
  exportedAt: '2026-10-21T10:00:00.000Z',
  quizzes: [
    {
      title: LONG_TITLE,
      description: 'D'.repeat(400),
      countries: ['IN'],
      timeLimitSeconds: null,
      perQuestionSeconds: null,
      retakesAllowed: true,
      questions: [
        {
          id: 'long-question',
          text: LONG_QUESTION,
          type: 'single',
          options: [
            { id: 'long-option', text: LONG_OPTION },
            { id: 'short-option', text: 'A short option' },
          ],
          correctOptionIds: ['long-option'],
        },
      ],
    },
  ],
}

async function importLongQuiz(page: Page): Promise<string> {
  await page.goto('/admin')
  await page.locator('input[type=file]').setInputFiles({
    name: 'long.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(quizFile)),
  })
  await expect(page.getByRole('status')).toContainText('Imported 1 quiz')
  return page.evaluate<string>(
    "JSON.parse(localStorage.getItem('quiz-platform:db:v1')).state.quizzes.at(-1).id",
  )
}

/**
 * The page must never be wider than the screen, or the user has to scroll sideways to read it.
 * The screen width comes from the test's viewport: on a phone, `window.innerWidth` itself grows to
 * fit wide content, so it cannot be trusted to show the problem.
 */
async function expectNoSidewaysScroll(page: Page, screen: string) {
  const screenWidth = page.viewportSize()?.width ?? 0
  const scrollWidth = await page.evaluate<number>('document.documentElement.scrollWidth')
  expect(scrollWidth, `${screen} is wider than the screen`).toBeLessThanOrEqual(screenWidth)
}

test('long unbroken text wraps on every screen instead of widening the page', async ({ page }) => {
  const quizId = await importLongQuiz(page)
  await expectNoSidewaysScroll(page, 'the admin list')

  await page.goto('/')
  await expect(page.getByRole('link', { name: LONG_TITLE })).toBeVisible()
  await expectNoSidewaysScroll(page, 'the quiz list')

  await page.goto(`/quiz/${quizId}`)
  await expect(page.getByRole('heading', { name: LONG_TITLE, level: 1 })).toBeVisible()
  await expectNoSidewaysScroll(page, 'the start screen')

  await page.getByRole('link', { name: 'Start quiz' }).click()
  await expect(page.getByRole('heading', { name: LONG_QUESTION })).toBeVisible()
  await expectNoSidewaysScroll(page, 'the question screen')

  await page.getByRole('radio', { name: LONG_OPTION }).locator('xpath=ancestor::label').click()
  await page.getByRole('button', { name: 'Finish quiz' }).click()
  await expect(page).toHaveURL(/\/results\//)
  await expectNoSidewaysScroll(page, 'the results screen')

  await page.goto(`/leaderboard/${quizId}`)
  await expect(page.getByText('Aarav Menon').filter({ visible: true }).first()).toBeVisible()
  await expectNoSidewaysScroll(page, 'the leaderboard')

  await page.goto(`/admin/${quizId}/edit`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Edit')
  await expectNoSidewaysScroll(page, 'the quiz editor')
})
