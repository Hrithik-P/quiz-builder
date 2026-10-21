import { Link, useParams } from 'react-router'
import { ArrowRightIcon } from 'lucide-react'
import { FinalResultPanel } from '../components/quiz/FinalResultPanel'
import { QuizFacts } from '../components/quiz/QuizFacts'
import { QuizHero } from '../components/quiz/QuizHero'
import { QuizRules } from '../components/quiz/QuizRules'
import { QuizUnavailable } from '../components/quiz/QuizUnavailable'
import { Button } from '../components/ui/Button'
import { Notice } from '../components/ui/Notice'
import { quizService } from '../services/quizService'
import { useSessionStore } from '../store/sessionStore'
import { formatPercentage } from '../utils/format'

export function QuizStartPage() {
  const { quizId = '' } = useParams()
  const userId = useSessionStore((state) => state.userId)
  const quiz = quizService.getQuizSummary(quizId, userId)

  if (!quiz) return <QuizUnavailable reason="not-found" />

  const inProgress = quizService.getInProgressAttempt(quiz.id, userId)
  const priorResult = quizService.getBestResult(quiz.id, userId)
  const locked = quiz.completed && !quiz.retakesAllowed

  return (
    <section
      aria-labelledby="quiz-title"
      className="grid gap-5 lg:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8"
    >
      <QuizHero
        quizId={quiz.id}
        headingId="quiz-title"
        title={quiz.title}
        description={quiz.description}
        badge={priorResult ? `Your best · ${formatPercentage(priorResult.percentage)}` : undefined}
      />

      <div className="flex flex-col justify-center gap-6 lg:px-4">
        {locked && priorResult ? (
          <FinalResultPanel result={priorResult} />
        ) : (
          <>
            <QuizFacts quiz={quiz} />
            {inProgress ? (
              <Notice tone="accent">
                You have an unfinished attempt (question {inProgress.currentQuestionIndex + 1} of{' '}
                {inProgress.totalQuestions}). Time kept running while you were away.
              </Notice>
            ) : null}
            <QuizRules
              timeLimitSeconds={quiz.timeLimitSeconds}
              perQuestionSeconds={quiz.perQuestionSeconds}
            />
            <div className="flex flex-col items-stretch gap-2">
              <Button asChild size="xl">
                <Link to={`/quiz/${quiz.id}/attempt/${inProgress?.id ?? 'new'}`}>
                  {inProgress ? 'Resume quiz' : 'Start quiz'}
                  <ArrowRightIcon size={22} />
                </Link>
              </Button>
              <Link
                to={`/leaderboard/${quiz.id}`}
                className="inline-flex min-h-11 items-center justify-center font-bold"
              >
                See the leaderboard
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
