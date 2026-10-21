import type { Attempt, Question, Quiz, QuizData } from '../types/models'
import type {
  AttemptResult,
  AttemptState,
  LeaderboardEntry,
  PublicQuestion,
  QuizInfo,
  QuizSummary,
  TimerInfo,
} from '../types/views'
import { rankAttempts } from './leaderboard'
import { buildResult } from './scoring'
import { getDeadlines } from './timing'

/**
 * Pure reads over the stored data. They never write and never look at the clock on their own,
 * so a screen calls them during render with the data from `useQuizData()`.
 */

/** An attempt is stale when its quiz was saved again after the attempt started. Missing counts as 0. */
export function isQuizEdited(attempt: Attempt, quiz: Quiz): boolean {
  return (attempt.quizRevision ?? 0) !== (quiz.revision ?? 0)
}

export function toQuizInfo(quiz: Quiz): QuizInfo {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    countries: quiz.countries,
    timeLimitSeconds: quiz.timeLimitSeconds,
    perQuestionSeconds: quiz.perQuestionSeconds,
    retakesAllowed: quiz.retakesAllowed,
    questionCount: quiz.questions.length,
  }
}

/** The only place a question becomes something the UI may see: without its correct answers. */
export function toPublicQuestion(question: Question): PublicQuestion {
  return { id: question.id, text: question.text, type: question.type, options: question.options }
}

function getUserAttempts(data: QuizData, quizId: string, userId: string): Attempt[] {
  return data.attempts.filter((attempt) => attempt.quizId === quizId && attempt.userId === userId)
}

export function getQuizSummary(
  data: QuizData,
  quizId: string,
  userId: string,
): QuizSummary | undefined {
  const quiz = data.quizzes.find((candidate) => candidate.id === quizId)
  if (!quiz) return undefined

  const best = rankAttempts(getUserAttempts(data, quizId, userId), data.users)[0]
  return {
    ...toQuizInfo(quiz),
    completed: best !== undefined,
    bestScore: best?.score ?? null,
    bestPercentage: best?.percentage ?? null,
  }
}

/** Quizzes assigned to the country (no country means all), with the user's completion and best score. */
export function getQuizzes(data: QuizData, userId: string, country?: string): QuizSummary[] {
  return data.quizzes
    .filter((quiz) => !country || quiz.countries.includes(country))
    .map((quiz) => getQuizSummary(data, quiz.id, userId))
    .filter((summary) => summary !== undefined)
}

export function getQuizInfo(data: QuizData, quizId: string): QuizInfo | undefined {
  const quiz = data.quizzes.find((candidate) => candidate.id === quizId)
  return quiz && toQuizInfo(quiz)
}

/** The user's resumable attempt. One whose quiz was edited since it started is not resumable. */
export function getInProgressAttempt(
  data: QuizData,
  quizId: string,
  userId: string,
): Attempt | undefined {
  const quiz = data.quizzes.find((candidate) => candidate.id === quizId)
  if (!quiz) return undefined
  return getUserAttempts(data, quizId, userId).find(
    (attempt) => attempt.status === 'in_progress' && !isQuizEdited(attempt, quiz),
  )
}

/**
 * The attempt named in a URL, but only when it is this user's attempt at this quiz. Without the
 * check, a link could show one quiz's questions under another quiz's title, or let someone open
 * and answer another person's attempt.
 */
export function getAttemptFor(
  data: QuizData,
  attemptId: string,
  quizId: string,
  userId: string,
): Attempt | undefined {
  const attempt = data.attempts.find((candidate) => candidate.id === attemptId)
  return attempt?.quizId === quizId && attempt.userId === userId ? attempt : undefined
}

export function getResult(data: QuizData, attemptId: string): AttemptResult | undefined {
  const attempt = data.attempts.find((candidate) => candidate.id === attemptId)
  return attempt && buildResult(attempt)
}

/** The user's best completed attempt: highest score, then fastest time. */
export function getBestResult(
  data: QuizData,
  quizId: string,
  userId: string,
): AttemptResult | undefined {
  const best = rankAttempts(getUserAttempts(data, quizId, userId), data.users)[0]
  return best && getResult(data, best.attemptId)
}

/** Best attempt per user, ranked. Without a limit everyone is returned (to find the current user). */
export function getLeaderboard(data: QuizData, quizId: string, limit?: number): LeaderboardEntry[] {
  const quizAttempts = data.attempts.filter((attempt) => attempt.quizId === quizId)
  return rankAttempts(quizAttempts, data.users).slice(0, limit)
}

function toTimerInfo(endsAtMs: number | null, totalSeconds: number | null): TimerInfo | null {
  if (endsAtMs === null || totalSeconds === null) return null
  return { endsAt: new Date(endsAtMs).toISOString(), totalSeconds }
}

/**
 * What the attend screen shows for an attempt, without the correct answers. Remaining time is not
 * included: the screen derives it from each timer's `endsAt` and the clock.
 */
export function getCurrentQuestion(data: QuizData, attemptId: string): AttemptState {
  const attempt = data.attempts.find((candidate) => candidate.id === attemptId)
  if (!attempt) return { status: 'not_found' }
  if (attempt.status === 'completed') return { status: 'completed', attemptId }

  const quiz = data.quizzes.find((candidate) => candidate.id === attempt.quizId)
  if (!quiz) return { status: 'quiz_unavailable', reason: 'deleted' }

  const question = quiz.questions[attempt.answers.length]
  if (isQuizEdited(attempt, quiz) || !question) {
    return { status: 'quiz_unavailable', reason: 'edited' }
  }

  const { overallEndsAtMs, questionEndsAtMs } = getDeadlines(attempt, quiz)
  return {
    status: 'question',
    attemptId,
    question: toPublicQuestion(question),
    index: attempt.answers.length,
    total: quiz.questions.length,
    timers: {
      overall: toTimerInfo(overallEndsAtMs, quiz.timeLimitSeconds),
      question: toTimerInfo(questionEndsAtMs, quiz.perQuestionSeconds),
    },
  }
}
