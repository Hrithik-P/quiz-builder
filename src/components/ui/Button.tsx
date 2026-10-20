import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'
import { buttonClass, type ButtonSize, type ButtonVariant } from './styles'

interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Layout and colour only (flex-1, self-start, text-danger); size and padding come from `size`. */
  className?: string
}

type ButtonProps = ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className, size)} {...props} />
}

type ButtonLinkProps = ButtonStyleProps & LinkProps

/** A router link that looks like a button. */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className, size)} {...props} />
}
