import { describe, expect, it } from 'vitest'
import { initials, quizMonogram, quizTileClass } from './quizTheme'

describe('quizTheme', () => {
  it('gives each quiz a stable tile colour', () => {
    expect(quizTileClass('q1')).toBe(quizTileClass('q1'))
    expect(quizTileClass('q1')).toMatch(/^bg-tile-[1-5]$/)
  })

  it('gives the seed quizzes distinct colours', () => {
    const colours = ['q1', 'q2', 'q3', 'q4', 'q5'].map(quizTileClass)
    expect(new Set(colours).size).toBe(5)
  })

  it('builds monograms from the first two words', () => {
    expect(quizMonogram('JavaScript Basics')).toBe('JB')
    expect(quizMonogram('Science')).toBe('Sc')
    expect(quizMonogram('  ')).toBe('')
  })

  it('builds initials from a name', () => {
    expect(initials('Fatima Al Mansoori')).toBe('FA')
    expect(initials('Admin')).toBe('A')
  })
})
