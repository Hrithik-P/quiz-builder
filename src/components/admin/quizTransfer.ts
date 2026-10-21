import type { Quiz, QuizInput } from '../../types/models'
import { toDraft } from './quizDraft'
import { quizSchema } from './quizSchema'

export const QUIZ_FILE_FORMAT = 'quiz-platform/quizzes'
export const QUIZ_FILE_VERSION = 1
export const MAX_IMPORT_BYTES = 1_048_576

/** More than this and the list stops being readable, so the rest is summarised. */
const MAX_REPORTED_ERRORS = 10

export type ParseQuizFileResult =
  { ok: true; quizzes: QuizInput[] } | { ok: false; errors: string[] }

/** The file written by "Export all": the quizzes without their ids and revisions, plus a header. */
export function serializeQuizzes(quizzes: Quiz[], exportedAt: Date): string {
  const file = {
    format: QUIZ_FILE_FORMAT,
    version: QUIZ_FILE_VERSION,
    exportedAt: exportedAt.toISOString(),
    quizzes: quizzes.map(toDraft),
  }
  return JSON.stringify(file, null, 2)
}

/** e.g. quizzes-2026-10-21.json */
export function getExportFilename(exportedAt: Date): string {
  return `quizzes-${exportedAt.toISOString().slice(0, 10)}.json`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** "Quiz 2 (“Kerala”)": enough for the person to find the quiz in their file. */
function describeQuiz(rawQuiz: unknown, quizIndex: number): string {
  const title = isRecord(rawQuiz) ? rawQuiz.title : undefined
  const hasTitle = typeof title === 'string' && title.trim() !== ''
  return hasTitle ? `Quiz ${quizIndex + 1} (“${title.trim()}”)` : `Quiz ${quizIndex + 1}`
}

/** ['questions', 2, 'options', 0, 'text'] becomes "question 3, option 1, text". */
function describePath(path: readonly PropertyKey[]): string {
  const words: string[] = []
  let index = 0
  while (index < path.length) {
    const segment = path[index]
    const next = path[index + 1]
    if ((segment === 'questions' || segment === 'options') && typeof next === 'number') {
      words.push(`${segment === 'questions' ? 'question' : 'option'} ${next + 1}`)
      index += 2
    } else {
      words.push(String(segment))
      index += 1
    }
  }
  return words.join(', ')
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

function findDuplicates(ids: string[]): string[] {
  return ids.filter((id, position) => ids.indexOf(id) !== position)
}

/** Rules the admin form never needs, because it creates the ids and offers a fixed list of countries. */
function checkFileOnlyRules(
  quiz: QuizInput,
  label: string,
  knownCountryCodes: readonly string[],
): string[] {
  const problems: string[] = []

  for (const code of quiz.countries) {
    if (!knownCountryCodes.includes(code)) {
      problems.push(`${label}: unknown country code “${code}”.`)
    }
  }
  if (findDuplicates(quiz.questions.map((question) => question.id)).length > 0) {
    problems.push(`${label}: two questions share the same id.`)
  }

  for (const [questionIndex, question] of quiz.questions.entries()) {
    const where = `${label}, question ${questionIndex + 1}`
    const optionIds = question.options.map((option) => option.id)

    if (findDuplicates(optionIds).length > 0) {
      problems.push(`${where}: two options share the same id.`)
    }
    if (question.correctOptionIds.some((id) => !optionIds.includes(id))) {
      problems.push(`${where}: a correct answer points at an option that does not exist.`)
    }
    for (const [optionIndex, option] of question.options.entries()) {
      if (option.imageUrl !== undefined && !isHttpUrl(option.imageUrl)) {
        problems.push(
          `${where}, option ${optionIndex + 1}: the image must be an http or https link.`,
        )
      }
    }
  }
  return problems
}

function limitErrors(errors: string[]): string[] {
  if (errors.length <= MAX_REPORTED_ERRORS) return errors
  const hidden = errors.length - MAX_REPORTED_ERRORS
  return [
    ...errors.slice(0, MAX_REPORTED_ERRORS),
    `…and ${hidden} more ${hidden === 1 ? 'problem' : 'problems'}.`,
  ]
}

/**
 * Reads the text of an imported file. The file is untrusted, so this never throws: it returns
 * every problem it finds, and the caller imports nothing unless there are none.
 */
export function parseQuizFile(
  text: string,
  knownCountryCodes: readonly string[],
): ParseQuizFileResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['This file is not valid JSON.'] }
  }

  if (!isRecord(parsed) || parsed.format !== QUIZ_FILE_FORMAT) {
    return { ok: false, errors: ['This is not a quiz file exported from this app.'] }
  }
  if (parsed.version !== QUIZ_FILE_VERSION) {
    return {
      ok: false,
      errors: [`Unsupported file version. This app reads version ${QUIZ_FILE_VERSION}.`],
    }
  }
  if (!Array.isArray(parsed.quizzes) || parsed.quizzes.length === 0) {
    return { ok: false, errors: ['The file does not contain any quizzes.'] }
  }

  const quizzes: QuizInput[] = []
  const errors: string[] = []

  for (const [quizIndex, rawQuiz] of parsed.quizzes.entries()) {
    const label = describeQuiz(rawQuiz, quizIndex)
    const result = quizSchema.safeParse(rawQuiz)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const location = describePath(issue.path)
        errors.push(`${label}${location ? `, ${location}` : ''}: ${issue.message}`)
      }
      continue
    }

    const fileOnlyProblems = checkFileOnlyRules(result.data, label, knownCountryCodes)
    errors.push(...fileOnlyProblems)
    quizzes.push(result.data)
  }

  return errors.length > 0 ? { ok: false, errors: limitErrors(errors) } : { ok: true, quizzes }
}
