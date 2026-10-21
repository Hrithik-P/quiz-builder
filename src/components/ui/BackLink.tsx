import { Link } from 'react-router'
import { ArrowLeftIcon } from 'lucide-react'

type Surface = 'page' | 'tile' | 'panel'

const surfaces: Record<Surface, string> = {
  page: 'gap-1.5 text-muted hover:text-fg',
  tile: 'gap-2 rounded-full border-2 border-edge bg-white pr-4 pl-3 font-bold text-tile-fg shadow-pop-sm',
  panel:
    'gap-2 rounded-full border-2 border-panel-muted/40 pr-4 pl-3 font-bold text-panel-fg hover:bg-white/10',
}

interface BackLinkProps {
  to?: string
  surface?: Surface
  children?: string
}

export function BackLink({ to = '/', surface = 'page', children = 'All quizzes' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`relative inline-flex min-h-11 items-center self-start text-sm no-underline ${surfaces[surface]}`}
    >
      <ArrowLeftIcon size={surface === 'page' ? 16 : 18} />
      {children}
    </Link>
  )
}
