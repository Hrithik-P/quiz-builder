import seedJson from '../data/seed.json'
import type { Database } from '../types/models'

/** Bump the suffix if the stored shape changes. */
export const DB_STORAGE_KEY = 'quiz-platform:db:v1'

const seed = seedJson as Database

function freshSeed(): Database {
  return structuredClone(seed)
}

// Keyed on the raw string, so it stays valid when another tab changes storage.
let cache: { raw: string; db: Database } | null = null

export function readDb(): Database {
  const raw = localStorage.getItem(DB_STORAGE_KEY)
  if (raw === null) {
    const db = freshSeed()
    writeDb(db)
    return structuredClone(db)
  }
  if (cache?.raw !== raw) cache = { raw, db: JSON.parse(raw) as Database }
  return structuredClone(cache.db)
}

export function writeDb(db: Database): void {
  const raw = JSON.stringify(db)
  localStorage.setItem(DB_STORAGE_KEY, raw)
  cache = { raw, db: structuredClone(db) }
}

export function resetDb(): void {
  writeDb(freshSeed())
}

let version = 0
const listeners = new Set<() => void>()

export function notifyChange(): void {
  version += 1
  for (const listener of listeners) listener()
}

export function getVersion(): number {
  return version
}

function onStorage(event: StorageEvent) {
  if (event.key === DB_STORAGE_KEY || event.key === null) notifyChange()
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener('storage', onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
