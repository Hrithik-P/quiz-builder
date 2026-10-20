import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">Page not found</h1>
      <Link to="/" className="text-accent underline">
        Back to quizzes
      </Link>
    </section>
  )
}
