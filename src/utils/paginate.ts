/** Clamps an out-of-range page, e.g. after a search shrinks the list. */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  return {
    page: current,
    pageCount,
    items: items.slice((current - 1) * pageSize, current * pageSize),
  }
}
