interface PlaceholderProps {
  title: string
}

/** Temporary stand-in for screens that are not built yet. */
export function Placeholder({ title }: PlaceholderProps) {
  return (
    <section>
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="text-muted">Not built yet.</p>
    </section>
  )
}
