import type { Attempt, Quiz } from '../types/models'
import { appendAnswer, finalizeAttempt } from './attempt'

/**
 * How long past a deadline a submission is still accepted. It covers the gap between the timer
 * reaching zero and the page submitting the selected answer.
 */
export const SUBMIT_GRACE_MS = 2000

export interface Deadlines {
  /** Epoch ms, or null when the quiz has no overall limit. */
  overallEndsAtMs: number | null
  /** Epoch ms, or null when the quiz has no per-question limit. */
  questionEndsAtMs: number | null
}

/** The moment the current question started: the previous answer, or the attempt start. */
function getQuestionStartedAtMs(attempt: Attempt): number {
  const lastAnswer = attempt.answers.at(-1)
  return Date.parse(lastAnswer?.answeredAt ?? attempt.startedAt)
}

/** Everything is derived from stored timestamps, so reloads and background tabs stay accurate. */
export function getDeadlines(attempt: Attempt, quiz: Quiz): Deadlines {
  const { timeLimitSeconds, perQuestionSeconds } = quiz
  return {
    overallEndsAtMs:
      timeLimitSeconds === null ? null : Date.parse(attempt.startedAt) + timeLimitSeconds * 1000,
    questionEndsAtMs:
      perQuestionSeconds === null
        ? null
        : getQuestionStartedAtMs(attempt) + perQuestionSeconds * 1000,
  }
}

function hasPassed(deadlineMs: number | null, nowMs: number): deadlineMs is number {
  return deadlineMs !== null && nowMs > deadlineMs + SUBMIT_GRACE_MS
}

/**
 * Applies every deadline that has passed: unanswered questions get an empty answer stamped at their
 * deadline, and the attempt completes when the overall limit or the last question is reached.
 */
export function settleAttempt(attempt: Attempt, quiz: Quiz, nowMs: number): Attempt {
  let settled = attempt

  while (settled.status === 'in_progress') {
    if (settled.answers.length >= quiz.questions.length) {
      return finalizeAttempt(settled, quiz, getQuestionStartedAtMs(settled))
    }

    const { overallEndsAtMs, questionEndsAtMs } = getDeadlines(settled, quiz)
    const overallFirst =
      overallEndsAtMs !== null && (questionEndsAtMs === null || overallEndsAtMs <= questionEndsAtMs)

    if (overallFirst && hasPassed(overallEndsAtMs, nowMs)) {
      return finalizeAttempt(settled, quiz, overallEndsAtMs)
    }
    if (!overallFirst && hasPassed(questionEndsAtMs, nowMs)) {
      settled = appendAnswer(settled, quiz, [], questionEndsAtMs)
      continue
    }
    return settled
  }

  return settled
}
