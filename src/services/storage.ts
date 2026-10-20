import seedJson from '../data/seed.json'
import type { Database } from '../types/models'

/** Bump the suffix if the stored shape ever changes incompatibly. */
export const DB_STORAGE_KEY = 'quiz-platform:db:v1'

const seed = seedJson as Database

function freshSeed(): Database {
  return structuredClone(seed)
}

// Parsed copy of the last raw string read, so repeated reads skip JSON.parse. Keying the cache
// on the raw string keeps it correct when storage changes underneath us (other tabs, tests).
let cache: { raw: string; db: Database } | null = null

/** Reads the database, seeding it on first load. */
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

/** Restores the seed, dropping every change. */
export function resetDb(): void {
  writeDb(freshSeed())
}

// Change notifications, so every mounted screen re-reads after a write.
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

/** Subscribes to data changes, including ones made in other tabs. */
export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener('storage', onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
