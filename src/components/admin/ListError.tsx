/** Renders a list-level form error (e.g. "Add at least one question.") for ErrorMessage. */
export function ListError({ message }: { message: string }) {
  return <p className="mt-1 text-sm text-danger">{message}</p>
}
