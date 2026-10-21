import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { getAttemptFor, getCurrentQuestion, getQuizInfo } from '../services/quizQueries'
import { useQuizData, useQuizStore } from '../store/quizStore'
import { useSessionStore } from '../store/sessionStore'
import type { AttemptState } from '../types/views'

/** The URL segment used before an attempt exists. The hook starts one and swaps in its real id. */
export const NEW_ATTEMPT_ID = 'new'

export type QuizAttemptView = AttemptState | { status: 'loading' }

/**
 * Connects the attend screen to the store. The store owns the attempt, so the view is read from it
 * on every render instead of being copied into component state.
 */
export function useQuizAttempt(quizId: string, attemptId: string) {
  const data = useQuizData()
  const userId = useSessionStore((state) => state.userId)
  const startOrResumeAttempt = useQuizStore((state) => state.startOrResumeAttempt)
  const refreshAttempt = useQuizStore((state) => state.refreshAttempt)
  const submitAnswer = useQuizStore((state) => state.submitAnswer)
  const navigate = useNavigate()
  const isNewAttempt = attemptId === NEW_ATTEMPT_ID
  // The URL names the attempt, so check it really is this user's attempt at this quiz.
  const isOwnAttempt = getAttemptFor(data, attemptId, quizId, userId) !== undefined

  useEffect(() => {
    if (!isNewAttempt) {
      // Opening an attempt applies the time that passed while the user was away.
      if (isOwnAttempt) refreshAttempt(attemptId)
      return
    }
    const result = startOrResumeAttempt(quizId, userId)
    // Retakes are off or the quiz is gone: the quiz page explains which.
    navigate(result.ok ? `/quiz/${quizId}/attempt/${result.attempt.id}` : `/quiz/${quizId}`, {
      replace: true,
    })
  }, [
    isNewAttempt,
    isOwnAttempt,
    attemptId,
    quizId,
    userId,
    startOrResumeAttempt,
    refreshAttempt,
    navigate,
  ])

  const view: QuizAttemptView = isNewAttempt
    ? { status: 'loading' }
    : isOwnAttempt
      ? getCurrentQuestion(data, attemptId)
      : { status: 'not_found' }

  return {
    view,
    quizTitle: getQuizInfo(data, quizId)?.title ?? 'Quiz',
    submitAnswer: (questionId: string, optionIds: string[]) =>
      submitAnswer(attemptId, questionId, optionIds),
  }
}
