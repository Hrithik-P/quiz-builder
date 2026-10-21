import { useRef, type ChangeEvent } from 'react'
import { Button } from '../ui/Button'

interface QuizTransferButtonsProps {
  canExport: boolean
  onExport: () => void
  onImportFile: (file: File) => void
}

export function QuizTransferButtons({
  canExport,
  onExport,
  onImportFile,
}: QuizTransferButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Clear the picker so choosing the same file again still counts as a change.
    event.target.value = ''
    if (file) onImportFile(file)
  }

  return (
    <>
      <Button
        variant="secondary"
        aria-label="Import quizzes"
        onClick={() => fileInputRef.current?.click()}
      >
        Import
      </Button>
      <Button
        variant="secondary"
        aria-label="Export all quizzes"
        disabled={!canExport}
        onClick={onExport}
      >
        Export all
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        aria-label="Quiz file to import"
        className="hidden"
        onChange={handleFileChosen}
      />
    </>
  )
}
