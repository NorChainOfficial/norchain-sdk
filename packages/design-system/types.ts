/**
 * Type Definitions
 * Shared types for the design system
 */

export type ColorVariant = 'primary' | 'shariah' | 'defi' | 'success' | 'warning' | 'error'
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type Theme = 'light' | 'dark' | 'auto'

export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: Size
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export interface CardProps extends ComponentProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: Size
}

export interface BadgeProps extends ComponentProps {
  variant?: ColorVariant
  size?: 'sm' | 'md' | 'lg'
}

