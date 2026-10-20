export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

/** The "pressable" look: an ink outline and a hard shadow that collapses when pressed. */
const pressable =
  'border-2 border-edge shadow-pop-sm transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-pop active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:translate-0 disabled:shadow-none'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-2xl py-2 font-bold no-underline disabled:cursor-not-allowed disabled:opacity-50'

/* Sizes own padding, height and type so callers never pass classes that fight the base. */
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-5 text-[0.95rem]',
  lg: 'min-h-14 px-6 text-base',
  xl: 'min-h-16 px-8 font-display text-xl',
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: `${pressable} bg-accent text-accent-fg`,
  secondary: `${pressable} bg-surface text-fg`,
  danger: `${pressable} bg-danger text-bg`,
  ghost: 'border-2 border-transparent hover:border-line hover:bg-surface',
}

/**
 * Classes for anything that should look like a button (<button> or <Link>).
 * `extra` is for layout and colour only (flex-1, self-start, text-danger), not size or padding.
 */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  extra = '',
  size: ButtonSize = 'md',
): string {
  return `${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${extra}`.trim()
}

export const inputClass =
  'w-full min-h-11 rounded-xl border-2 border-edge bg-surface px-3 py-2 text-fg placeholder:text-muted aria-invalid:border-danger'

export const labelClass = 'mb-1 block text-sm font-semibold'

export const cardClass = 'rounded-3xl border-2 border-edge bg-surface p-5 shadow-pop'

/** Small uppercase label above a group ("All quizzes", "Before you start"). */
export const eyebrowClass = 'text-xs font-bold tracking-[0.08em] text-muted uppercase'

/** Big display headline. */
export const displayClass = 'font-display font-extrabold tracking-tight'
