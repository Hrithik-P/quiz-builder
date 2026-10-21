import { useId } from 'react'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'
import { quizSortOptions, type QuizSortKey } from './quizSort'

interface AdminQuizFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  sort: QuizSortKey
  onSortChange: (sort: QuizSortKey) => void
}

export function AdminQuizFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: AdminQuizFiltersProps) {
  const searchId = useId()
  const sortId = useId()

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
      <div>
        <Label htmlFor={searchId} className="mb-1">
          Search
        </Label>
        <Input
          id={searchId}
          type="search"
          placeholder="Search by title or description"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={sortId} className="mb-1">
          Sort by
        </Label>
        <Select value={sort} onValueChange={(value) => onSortChange(value as QuizSortKey)}>
          <SelectTrigger id={sortId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {quizSortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
