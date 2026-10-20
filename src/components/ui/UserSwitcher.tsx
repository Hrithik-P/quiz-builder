import { useId } from 'react'
import type { User } from '../../types/models'
import { initials } from '../../utils/quizTheme'
import { ChevronDownIcon } from './icons'

interface UserSwitcherProps {
  users: User[]
  userId: string
  onChange: (userId: string) => void
  /** "light" sits on the page background, "panel" on the dark nav panel. */
  surface?: 'light' | 'panel'
}

/** A native select dressed as an avatar pill (there is no real login). */
export function UserSwitcher({ users, userId, onChange, surface = 'light' }: UserSwitcherProps) {
  const id = useId()
  const current = users.find((u) => u.id === userId)
  const onPanel = surface === 'panel'

  return (
    <div
      className={`relative flex min-h-11 items-center gap-2 border-2 py-1 pr-9 pl-1 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus ${
        onPanel
          ? 'w-full rounded-2xl border-panel-muted/30 bg-white/5 text-panel-fg'
          : 'rounded-full border-edge bg-surface shadow-pop-sm'
      }`}
    >
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg"
      >
        {current ? initials(current.name) : '?'}
      </span>
      <label htmlFor={id} className="sr-only">
        Current user
      </label>
      <select
        id={id}
        value={userId}
        onChange={(event) => onChange(event.target.value)}
        className={`absolute inset-0 cursor-pointer appearance-none rounded-[inherit] bg-transparent pl-12 font-semibold focus-visible:outline-none ${
          onPanel ? 'text-panel-fg' : 'text-fg'
        }`}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id} className="text-fg">
            {user.name} ({user.country})
          </option>
        ))}
      </select>
      {/* The select draws the name; this keeps the pill's width when the select is absolutely placed. */}
      <span aria-hidden="true" className="invisible font-semibold whitespace-nowrap">
        {current ? `${current.name} (${current.country})` : 'Choose user'}
      </span>
      <ChevronDownIcon
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
      />
    </div>
  )
}
