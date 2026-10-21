import type { Attempt, Question, Quiz } from '../types/models'
import { appendAnswer, finalizeAttempt } from './attempt'
import { isQuizEdited } from './quizQueries'
import { getDeadlines, settleAttempt } from './timing'

function assertValidSelection(question: Question, optionIds: string[]): void {
  const knownOptionIds = new Set(question.options.map((option) => option.id))
  const isKnown = optionIds.every((optionId) => knownOptionIds.has(optionId))
  const hasTooMany = question.type === 'single' && optionIds.length > 1
  // An empty selection is valid: it is what a timeout submits when nothing was chosen.
  if (!isKnown || hasTooMany)
    throw new Error('The selected options are not valid for this question.')
}

/**
 * Applies the deadlines that passed, then records the answer if `questionId` is still the current
 * question. Returns the attempt to save, which is the same object when nothing changed.
 * Throws when the options do not belong to the question.
 */
export function recordAnswer(
  attempt: Attempt,
  quiz: Quiz,
  questionId: string,
  optionIds: string[],
  nowMs: number,
): Attempt {
  if (attempt.status !== 'in_progress' || isQuizEdited(attempt, quiz)) return attempt

  const settled = settleAttempt(attempt, quiz, nowMs)
  const question = quiz.questions[settled.answers.length]
  // A double click or a stale tab answers a question that is no longer current: nothing to record,
  // but the settled attempt is still returned so the expired time gets saved.
  if (settled.status !== 'in_progress' || !question || question.id !== questionId) return settled
  assertValidSelection(question, optionIds)

  // A submission accepted in the grace window counts as made at the deadline.
  const { overallEndsAtMs, questionEndsAtMs } = getDeadlines(settled, quiz)
  const answeredAtMs = Math.min(nowMs, overallEndsAtMs ?? nowMs, questionEndsAtMs ?? nowMs)

  const answered = appendAnswer(settled, quiz, optionIds, answeredAtMs)
  const isOutOfTime = overallEndsAtMs !== null && nowMs >= overallEndsAtMs
  const isLastQuestion = answered.answers.length >= quiz.questions.length
  return isLastQuestion || isOutOfTime ? finalizeAttempt(answered, quiz, answeredAtMs) : answered
}
