import { describe, expect, it } from 'vitest'
import { paginate } from '../../utils/paginate'

const items = [1, 2, 3, 4, 5]

describe('paginate', () => {
  it('returns the requested page', () => {
    expect(paginate(items, 2, 2)).toEqual({ page: 2, pageCount: 3, items: [3, 4] })
  })

  it('clamps a page past the end, e.g. after a search shrinks the list', () => {
    expect(paginate(items, 9, 2)).toEqual({ page: 3, pageCount: 3, items: [5] })
  })

  it('always has at least one page', () => {
    expect(paginate([], 1, 4)).toEqual({ page: 1, pageCount: 1, items: [] })
  })
})
