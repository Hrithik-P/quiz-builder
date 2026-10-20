/** Background classes for the per-quiz colours (spelled out so Tailwind can see them). */
const TILE_CLASSES = ['bg-tile-1', 'bg-tile-2', 'bg-tile-3', 'bg-tile-4', 'bg-tile-5'] as const

/** A stable colour for a quiz, derived from its id so it never changes between screens. */
export function quizTileClass(quizId: string): string {
  let hash = 0
  for (const char of quizId) hash = (hash + char.charCodeAt(0)) % TILE_CLASSES.length
  return TILE_CLASSES[hash] ?? 'bg-tile-3'
}

/** "JavaScript Basics" → "JB", "Science" → "Sc". */
export function quizMonogram(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  const [first = '', second] = words
  if (second) return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
  return first.slice(0, 2)
}

/** "Aarav Menon" → "AM". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
