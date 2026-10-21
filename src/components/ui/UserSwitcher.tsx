import type { User } from '../../types/models'
import { cn } from '../../utils/cn'
import { initials } from '../../utils/quizTheme'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select'

interface UserSwitcherProps {
  users: User[]
  userId: string
  onChange: (userId: string) => void
  surface?: 'light' | 'panel'
}

/** Picks the current user (there is no real login). */
export function UserSwitcher({ users, userId, onChange, surface = 'light' }: UserSwitcherProps) {
  const current = users.find((user) => user.id === userId)
  return (
    <Select value={userId} onValueChange={onChange}>
      <SelectTrigger
        aria-label={current ? `Current user: ${current.name}` : 'Current user'}
        className={cn(
          'w-auto gap-2 py-1 pl-1 font-semibold [&>span]:flex [&>span]:items-center [&>span]:gap-2',
          surface === 'panel'
            ? 'w-full rounded-2xl border-panel-muted/30 bg-white/5 text-panel-fg'
            : 'rounded-full shadow-pop-sm',
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg"
              >
                {initials(user.name)}
              </span>
              {user.name} ({user.country})
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
