import { useId } from 'react'
import { eyebrowClass } from '../../styles/styles'
import type { Quiz } from '../../types/models'
import { QuizTile } from '../quiz/QuizTile'
import { Label } from '../ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'

interface QuizPickerProps {
  quizzes: Pick<Quiz, 'id' | 'title'>[]
  value: string
  onChange: (quizId: string) => void
}

export function QuizPicker({ quizzes, value, onChange }: QuizPickerProps) {
  const id = useId()

  return (
    <div className="flex w-full flex-col gap-1.5 lg:w-96">
      <Label htmlFor={id} className={eyebrowClass}>
        Quiz
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="min-h-13 rounded-2xl pl-2 font-bold shadow-pop-sm [&>span]:flex [&>span]:items-center [&>span]:gap-3"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {quizzes.map((quiz) => (
            <SelectItem key={quiz.id} value={quiz.id}>
              <span className="flex items-center gap-3">
                <QuizTile
                  quizId={quiz.id}
                  title={quiz.title}
                  className="size-9 rounded-xl text-sm"
                />
                {quiz.title}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
