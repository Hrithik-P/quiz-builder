import { useState } from 'react'
import { MAX_IMPORT_BYTES, parseQuizFile } from '../components/admin/quizTransfer'
import { useQuizData, useQuizStore } from '../store/quizStore'

export type ImportOutcome =
  | { status: 'idle' }
  | { status: 'imported'; count: number }
  | { status: 'rejected'; errors: string[] }

const MAX_IMPORT_LABEL = `${MAX_IMPORT_BYTES / 1_048_576} MB`

/**
 * Reads a chosen file, checks it, and adds its quizzes only if every one is valid. The outcome is
 * kept so the screen can say what happened; nothing is imported when it is "rejected".
 */
export function useQuizImport() {
  const { countries } = useQuizData()
  const importQuizzes = useQuizStore((state) => state.importQuizzes)
  const [outcome, setOutcome] = useState<ImportOutcome>({ status: 'idle' })

  async function readAndImport(file: File): Promise<ImportOutcome> {
    if (file.size > MAX_IMPORT_BYTES) {
      return { status: 'rejected', errors: [`The file is larger than ${MAX_IMPORT_LABEL}.`] }
    }

    let text: string
    try {
      text = await file.text()
    } catch {
      return { status: 'rejected', errors: ['The file could not be read.'] }
    }

    const result = parseQuizFile(
      text,
      countries.map((country) => country.code),
    )
    if (!result.ok) return { status: 'rejected', errors: result.errors }

    try {
      return { status: 'imported', count: importQuizzes(result.quizzes).length }
    } catch (error) {
      // Saving can fail when the browser's storage is full.
      console.error('Importing quizzes failed:', error)
      return {
        status: 'rejected',
        errors: ['The quizzes could not be saved. The browser storage may be full.'],
      }
    }
  }

  async function importFile(file: File): Promise<ImportOutcome> {
    const result = await readAndImport(file)
    setOutcome(result)
    return result
  }

  return { outcome, importFile, dismissOutcome: () => setOutcome({ status: 'idle' }) }
}
