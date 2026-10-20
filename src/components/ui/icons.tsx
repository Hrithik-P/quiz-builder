import type { ReactNode, SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

/** Stroke icons drawn on a 24-unit grid. Decorative: the surrounding control carries the label. */
function Svg({
  size = 20,
  weight = 2,
  children,
  ...props
}: IconProps & { weight?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg weight={3} {...props}>
      <path d="m5 12 5 5 9-10" />
    </Svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  )
}

export function GridIcon(props: IconProps) {
  return (
    <Svg weight={2} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </Svg>
  )
}

export function PodiumIcon(props: IconProps) {
  return (
    <Svg weight={2} {...props}>
      <path d="M8 21V11H3v10z" />
      <path d="M15 21V5H9v16z" />
      <path d="M21 21v-7h-5v7z" />
    </Svg>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <Svg weight={2} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
    </Svg>
  )
}

export function KeyboardIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" />
    </Svg>
  )
}

export function RetryIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </Svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <Svg weight={2} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </Svg>
  )
}

export function CheckboxIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="m8 12 3 3 5-6" />
    </Svg>
  )
}

export function RadioIcon(props: IconProps) {
  return (
    <Svg weight={2.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </Svg>
  )
}
