import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

// The same users the app starts with, so the test covers each of their names.
const seed = JSON.parse(
  readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8'),
) as { users: { id: string; name: string }[] }

// The switcher is drawn twice (phone header and desktop panel); only one is visible at a time.
const currentUser = (page: Page) =>
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

test('keeps every header control on screen on a phone, even for the longest user name', async ({
  page,
}) => {
  const viewportWidth = page.viewportSize()?.width ?? 0
  // The phone header is only drawn below the desktop breakpoint.
  test.skip(viewportWidth >= 1024, 'the phone header is not shown on desktop')

  await page.goto('/')
  const header = page.getByRole('banner')

  for (const user of seed.users) {
    await currentUser(page).click()
    await page.getByRole('option', { name: new RegExp(user.name) }).click()
    await expect(currentUser(page)).toHaveAccessibleName(`Current user: ${user.name}`)

    const controls = header.locator('a, button, [role=combobox]')
    for (const control of await controls.all()) {
      const box = await control.boundingBox()
      const name = (await control.getAttribute('aria-label')) ?? (await control.innerText())
      expect(box, `${name} for ${user.name}`).not.toBeNull()
      expect(box?.x, `${name} starts on screen for ${user.name}`).toBeGreaterThanOrEqual(0)
      expect(
        (box?.x ?? 0) + (box?.width ?? 0),
        `${name} ends on screen for ${user.name}`,
      ).toBeLessThanOrEqual(viewportWidth)
    }
  }
})
