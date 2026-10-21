/** Offers `text` to the user as a file download. */
export function downloadTextFile(filename: string, text: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Some browsers start the download after the click returns, so release the file a moment later.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
