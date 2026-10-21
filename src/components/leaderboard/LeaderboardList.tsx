import { Fragment } from 'react'
import type { LeaderboardEntry } from '../../types/views'
import { formatClock, formatPercentage } from '../../utils/format'

interface LeaderboardListProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  /** The current user's row when they are outside `entries`. */
  currentUserEntry?: LeaderboardEntry
}

const meRow = 'bg-accent/10 outline-2 -outline-offset-2 outline-accent'

function YouTag() {
  return <span className="ml-1.5 text-xs font-bold text-accent">· you</span>
}

/** Table or cards by container width (not viewport), so it fits narrow columns too. */
export function LeaderboardList({
  entries,
  currentUserId,
  currentUserEntry,
}: LeaderboardListProps) {
  const rows = currentUserEntry ? [...entries, currentUserEntry] : entries

  return (
    <div className="@container">
      <table className="hidden w-full border-separate border-spacing-y-1.5 text-left @lg:table">
        <caption className="sr-only">Leaderboard, ranked by score then fastest time</caption>
        <thead className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
          <tr>
            <th scope="col" className="px-4 py-2 font-bold">
              Rank
            </th>
            <th scope="col" className="px-4 py-2 font-bold">
              Player
            </th>
            <th scope="col" className="px-4 py-2 text-right font-bold">
              Score
            </th>
            <th scope="col" className="px-4 py-2 text-right font-bold">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => {
            const isMe = entry.userId === currentUserId
            const separated = entry === currentUserEntry
            return (
              <Fragment key={entry.attemptId}>
                {separated && (
                  <tr aria-hidden="true">
                    <td colSpan={4} className="h-2" />
                  </tr>
                )}
                <tr
                  aria-current={isMe ? 'true' : undefined}
                  className={`[&>*]:py-3.5 [&>*:first-child]:rounded-l-xl [&>*:last-child]:rounded-r-xl ${
                    isMe ? meRow : entry.rank === 1 ? 'bg-tile-3/25' : ''
                  }`}
                >
                  <td className="px-4 font-display text-xl font-extrabold tabular-nums">
                    {entry.rank}
                  </td>
                  <th scope="row" className="px-4 font-bold">
                    {entry.userName}
                    {isMe && <YouTag />}
                  </th>
                  <td className="px-4 text-right font-bold tabular-nums">
                    {entry.score}/{entry.totalQuestions}
                    <span className="ml-2 text-sm font-medium text-muted">
                      {formatPercentage(entry.percentage)}
                    </span>
                  </td>
                  <td className="px-4 text-right font-bold tabular-nums">
                    {formatClock(entry.timeTakenSeconds)}
                  </td>
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>

      <ol className="flex flex-col gap-2 @lg:hidden">
        {rows.map((entry) => {
          const isMe = entry.userId === currentUserId
          return (
            <li
              key={entry.attemptId}
              aria-current={isMe ? 'true' : undefined}
              className={`flex min-h-15 items-center gap-3 rounded-2xl border-2 px-3 ${
                entry === currentUserEntry ? 'mt-3' : ''
              } ${isMe ? 'border-accent bg-accent/10' : 'border-line'}`}
            >
              <span className="w-8 font-display text-xl font-extrabold tabular-nums">
                {entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {entry.userName}
                  {isMe && <YouTag />}
                </p>
                <p className="text-sm text-muted tabular-nums">
                  {formatPercentage(entry.percentage)}
                </p>
              </div>
              <span className="font-bold tabular-nums">
                {entry.score}/{entry.totalQuestions} · {formatClock(entry.timeTakenSeconds)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
