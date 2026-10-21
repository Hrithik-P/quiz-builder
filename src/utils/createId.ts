const RANDOM_BYTES = 6

/**
 * A short random id such as `quiz-3fa94c01b2d7`. It uses `getRandomValues` instead of
 * `randomUUID`, because `randomUUID` only exists on secure pages (https or localhost): on a plain
 * http address, such as the dev server opened from a phone, it is undefined and would crash.
 */
export function createId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_BYTES))
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${prefix}-${hex}`
}
