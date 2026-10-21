import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AttemptHeader, type AttemptTimer } from '../components/quiz/AttemptHeader'
import { QuestionView } from '../components/quiz/QuestionView'
import { QuizUnavailable } from '../components/quiz/QuizUnavailable'
import { SubmitBar } from '../components/quiz/SubmitBar'
import { quizService } from '../services/quizService'

// TODO: use useQuizAttempt / useCountdown once the data service exists.
export function QuizAttendPage() {
  const { quizId = '', attemptId = '' } = useParams()
  const navigate = useNavigate()
  const quiz = quizService.getQuiz(quizId)
  const resumed = quizService.getAttempt(attemptId)

  const [index, setIndex] = useState(resumed?.currentQuestionIndex ?? 0)
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Focus each new question for keyboard and screen-reader users.
  useEffect(() => {
    headingRef.current?.focus()
  }, [index])

  const question = quiz?.questions[index]
  if (!quiz || !question) {
    return (
      <div className="mx-auto max-w-2xl p-4 pt-10">
        <QuizUnavailable reason={quiz ? 'edited' : 'deleted'} />
      </div>
    )
  }

  const total = quiz.questions.length
  const isLast = index === total - 1
  const timers: AttemptTimer[] = []
  if (quiz.timeLimitSeconds !== null) {
    timers.push({
      label: 'Quiz',
      secondsLeft: quiz.timeLimitSeconds,
      totalSeconds: quiz.timeLimitSeconds,
    })
  }
  if (quiz.perQuestionSeconds !== null) {
    timers.push({
      label: 'Question',
      secondsLeft: quiz.perQuestionSeconds,
      totalSeconds: quiz.perQuestionSeconds,
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || selected.length === 0) return
    setSubmitting(true)
    if (isLast) {
      // TODO: completeAttempt(attemptId) first.
      navigate(`/results/${attemptId}`, { replace: true })
      return
    }
    setIndex(index + 1)
    setSelected([])
    setSubmitting(false)
  }

  // Enter on a radio or checkbox doesn't submit a form natively.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    }
  }

  return (
    <section aria-label={`${quiz.title} quiz`} className="flex min-h-dvh flex-col">
      <AttemptHeader
        quizId={quiz.id}
        quizTitle={quiz.title}
        questionNumber={index + 1}
        total={total}
        timers={timers}
      />

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pt-8 pb-6 sm:px-6 lg:pt-14"
      >
        {/* Keyed so each question replays the enter animation. */}
        <div key={question.id} className="animate-question-in">
          <QuestionView
            question={quizService.toPublicQuestion(question)}
            selectedOptionIds={selected}
            onChange={setSelected}
            disabled={submitting}
            headingRef={headingRef}
          />
        </div>
        <SubmitBar
          label={isLast ? 'Finish quiz' : 'Lock it in'}
          disabled={submitting || selected.length === 0}
        />
      </form>
    </section>
  )
}
