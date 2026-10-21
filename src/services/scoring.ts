import type { Attempt, Question } from '../types/models'
import type { AttemptResult } from '../types/views'

/** Correct only when the selection equals the correct set exactly (no partial credit). */
export function isAnswerCorrect(question: Question, selectedOptionIds: string[]): boolean {
  const selected = new Set(selectedOptionIds)
  const correct = new Set(question.correctOptionIds)
  return selected.size === correct.size && [...correct].every((optionId) => selected.has(optionId))
}

/** One decimal place, matching the seed (5 of 6 is 83.3). */
export function toPercentage(score: number, total: number): number {
  if (total === 0) return 0
  return Math.round((score / total) * 1000) / 10
}

/** The result of a completed attempt, or undefined while it is still in progress. */
export function buildResult(attempt: Attempt): AttemptResult | undefined {
  const { score, completedAt, timeTakenSeconds } = attempt
  if (attempt.status !== 'completed') return undefined
  if (score === null || completedAt === null || timeTakenSeconds === null) return undefined

  return {
    attemptId: attempt.id,
    quizId: attempt.quizId,
    userId: attempt.userId,
    score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage ?? toPercentage(score, attempt.totalQuestions),
    correctCount: score,
    incorrectCount: attempt.totalQuestions - score,
    timeTakenSeconds,
    completedAt,
  }
}
