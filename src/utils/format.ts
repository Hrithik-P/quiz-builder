import type { Quiz } from '../types/models'

/** 142 → "2:22" */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

/** 300 → "5 min", 90 → "1 min 30 s", 30 → "30 s" */
export function formatSeconds(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes === 0) return `${rest} s`
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`
}

export function formatTimeLimit(
  quiz: Pick<Quiz, 'timeLimitSeconds' | 'perQuestionSeconds'>,
): string {
  const parts: string[] = []
  if (quiz.timeLimitSeconds !== null) parts.push(`${formatSeconds(quiz.timeLimitSeconds)} total`)
  if (quiz.perQuestionSeconds !== null)
    parts.push(`${formatSeconds(quiz.perQuestionSeconds)} per question`)
  return parts.length > 0 ? parts.join(' · ') : 'No time limit'
}

export function formatPercentage(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`
}
