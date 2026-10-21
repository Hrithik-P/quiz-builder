import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'

interface Move {
  id: string
  from: number
  to: number
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const item = items[from]
  return item === undefined ? items : items.toSpliced(from, 1).toSpliced(to, 0, item)
}

/**
 * Space/Enter picks up, arrow keys move, Space/Enter drops, Escape cancels.
 * `items` shows the preview order; `onDrop` runs only on a real drop.
 */
export function useKeyboardReorder<T extends { id: string }>(
  items: T[],
  onDrop: (id: string, toIndex: number) => void,
) {
  const [move, setMove] = useState<Move | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const handles = useRef(new Map<string, HTMLElement>())

  // Moving the row in the DOM can drop focus, so restore it.
  useEffect(() => {
    if (move) handles.current.get(move.id)?.focus()
  }, [move])

  function onKeyDown(id: string, event: KeyboardEvent) {
    const isPickOrDrop = event.key === ' ' || event.key === 'Enter'

    if (!move) {
      if (!isPickOrDrop) return
      event.preventDefault()
      const index = items.findIndex((item) => item.id === id)
      setMove({ id, from: index, to: index })
      setAnnouncement(
        `Picked up question ${index + 1}. Use the up and down arrow keys to move it, then press Space to drop it, or Escape to cancel.`,
      )
      return
    }
    if (move.id !== id) return

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const step = event.key === 'ArrowUp' ? -1 : 1
      const to = Math.min(items.length - 1, Math.max(0, move.to + step))
      setMove({ ...move, to })
      setAnnouncement(`Position ${to + 1} of ${items.length}.`)
    } else if (isPickOrDrop) {
      event.preventDefault()
      setMove(null)
      if (move.to === move.from) {
        setAnnouncement(`Dropped. Question ${move.from + 1} stays where it was.`)
      } else {
        onDrop(id, move.to)
        setAnnouncement(`Dropped question ${move.from + 1} at position ${move.to + 1}.`)
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setMove(null)
      setAnnouncement(`Move cancelled. Question ${move.from + 1} stays where it was.`)
    }
  }

  // Tabbing away cancels; the blur from the row moving (no relatedTarget) does not.
  function onBlur(event: FocusEvent) {
    if (move && event.relatedTarget) {
      setMove(null)
      setAnnouncement(`Move cancelled. Question ${move.from + 1} stays where it was.`)
    }
  }

  function registerHandle(id: string) {
    return (node: HTMLElement | null) => {
      if (node) handles.current.set(id, node)
      else handles.current.delete(id)
    }
  }

  return {
    items: move ? moveItem(items, move.from, move.to) : items,
    movingId: move?.id ?? null,
    announcement,
    onKeyDown,
    onBlur,
    registerHandle,
  }
}
