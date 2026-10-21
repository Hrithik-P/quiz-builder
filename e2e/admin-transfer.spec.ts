import { expect, test, type Page } from '@playwright/test'

function quizHeading(page: Page, title: string) {
  return page.getByRole('heading', { name: title, level: 2 })
}

async function chooseImportFile(
  page: Page,
  file: string | { name: string; mimeType: string; buffer: Buffer },
) {
  const fileChooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Import quizzes' }).click()
  await (await fileChooser).setFiles(file)
}

test('exports every quiz, then imports the file to get a deleted quiz back', async ({
  page,
}, testInfo) => {
  await page.goto('/admin')
  await expect(quizHeading(page, 'General Science')).toBeVisible()

  // Export all: a real browser download.
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export all quizzes' }).click()
  const exported = await download
  expect(exported.suggestedFilename()).toMatch(/^quizzes-\d{4}-\d{2}-\d{2}\.json$/)
  const exportedPath = testInfo.outputPath('exported-quizzes.json')
  await exported.saveAs(exportedPath)

  // Delete a quiz, confirming the dialog.
  await page.getByRole('button', { name: 'Delete General Science' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
  await expect(quizHeading(page, 'General Science')).toHaveCount(0)

  // Import the file: the deleted quiz comes back (and the others are added again as copies).
  await chooseImportFile(page, exportedPath)
  await expect(page.getByText('Imported 5 quizzes.')).toBeVisible()
  await expect(quizHeading(page, 'General Science')).toBeVisible()
})

test('rejects a broken file, says why, and leaves the quizzes alone', async ({ page }) => {
  await page.goto('/admin')
  await expect(quizHeading(page, 'General Science')).toBeVisible()

  await chooseImportFile(page, {
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"this is": "not a quiz file"}'),
  })

  const alert = page.getByRole('alert')
  await expect(alert).toContainText('The file was not imported. Nothing was changed.')
  await expect(alert).toContainText('This is not a quiz file exported from this app.')

  await alert.getByRole('button', { name: 'Dismiss' }).click()
  await expect(alert).toHaveCount(0)
  await expect(quizHeading(page, 'General Science')).toBeVisible()
})
