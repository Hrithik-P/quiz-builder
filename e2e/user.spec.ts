import { expect, test } from '@playwright/test'

// The switcher is drawn twice (phone header and desktop panel); only one is visible at a time.
const currentUser = (page: import('@playwright/test').Page) =>
  page.getByRole('combobox', { name: /Current user/ }).filter({ visible: true })

test('remembers the chosen user after a reload', async ({ page }) => {
  await page.goto('/')
  await expect(currentUser(page)).toHaveAccessibleName('Current user: Aarav Menon')

  await currentUser(page).click()
  await page.getByRole('option', { name: /Fatima Al Mansoori/ }).click()
  await expect(currentUser(page)).toHaveAccessibleName('Current user: Fatima Al Mansoori')

  await page.reload()

  await expect(currentUser(page)).toHaveAccessibleName('Current user: Fatima Al Mansoori')
  await expect(page.getByText('Hi, Fatima')).toBeVisible()
})
