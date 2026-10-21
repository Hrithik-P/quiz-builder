import type { Attempt, Quiz } from '../types/models'
import { isAnswerCorrect, toPercentage } from './scoring'

/** Records an answer for the attempt's current question. Returns a new attempt. */
export function appendAnswer(
  attempt: Attempt,
  quiz: Quiz,
  selectedOptionIds: string[],
  answeredAtMs: number,
): Attempt {
  const question = quiz.questions[attempt.answers.length]
  if (!question) return attempt

  const answers = [
    ...attempt.answers,
    {
      questionId: question.id,
      selectedOptionIds,
      isCorrect: isAnswerCorrect(question, selectedOptionIds),
      answeredAt: new Date(answeredAtMs).toISOString(),
    },
  ]
  return { ...attempt, answers, currentQuestionIndex: answers.length }
}

/** Marks unanswered questions wrong, then stores the score and time taken. */
export function finalizeAttempt(attempt: Attempt, quiz: Quiz, completedAtMs: number): Attempt {
  let finished = attempt
  while (finished.answers.length < quiz.questions.length) {
    finished = appendAnswer(finished, quiz, [], completedAtMs)
  }

  const score = finished.answers.filter((answer) => answer.isCorrect).length
  const totalQuestions = quiz.questions.length
  const elapsedMs = Math.max(0, completedAtMs - Date.parse(finished.startedAt))

  return {
    ...finished,
    status: 'completed',
    completedAt: new Date(completedAtMs).toISOString(),
    score,
    totalQuestions,
    percentage: toPercentage(score, totalQuestions),
    timeTakenSeconds: Math.round(elapsedMs / 1000),
  }
}
