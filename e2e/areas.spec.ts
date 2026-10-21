import { expect, test } from '@playwright/test'

test('moves between the quiz area and the admin area', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pick your next quiz', level: 1 })).toBeVisible()

  // Learner area -> admin area.
  await page.getByRole('link', { name: 'Admin' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Manage quizzes', level: 1 })).toBeVisible()

  // The admin navigation works and marks the current page.
  const adminNav = page.getByRole('navigation', { name: 'Admin' })
  await adminNav.getByRole('link', { name: 'New quiz' }).click()
  await expect(page).toHaveURL(/\/admin\/new$/)
  await expect(adminNav.getByRole('link', { name: 'New quiz' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await adminNav.getByRole('link', { name: 'Manage quizzes' }).click()
  await expect(page).toHaveURL(/\/admin$/)

  // Admin area -> back to the quizzes.
  await page.getByRole('link', { name: 'Back to quizzes' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Pick your next quiz', level: 1 })).toBeVisible()
})

test('a page in the admin area can be opened directly and refreshed', async ({ page }) => {
  await page.goto('/admin/q1/edit')
  await expect(page.getByRole('heading', { name: /Edit .JavaScript Basics./ })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Admin' }).getByRole('link', { name: 'Manage quizzes' }),
  ).toHaveAttribute('aria-current', 'page')

  await page.reload()
  await expect(page.getByRole('heading', { name: /Edit .JavaScript Basics./ })).toBeVisible()
})
