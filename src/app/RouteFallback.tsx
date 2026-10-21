import { Skeleton } from '../components/ui/Skeleton'

/** Shown on the first load while a lazy-loaded page is still being fetched. */
export function RouteFallback() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
