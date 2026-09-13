import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { AppointmentStatus, type AppointmentStatusValue } from '../../types'
import { STATUS_LABELS } from '../../lib/status'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary'
  dot?: boolean
}

const DOT_COLOR: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'bg-neutral-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  primary: 'bg-primary-500',
}

export function Badge({ className, variant = 'neutral', dot = false, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        {
          'bg-neutral-100 text-neutral-600': variant === 'neutral',
          'bg-success-50 text-success-700 ring-1 ring-inset ring-success-100': variant === 'success',
          'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-100': variant === 'warning',
          'bg-danger-50 text-danger-600 ring-1 ring-inset ring-danger-100': variant === 'danger',
          'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100': variant === 'primary',
        },
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', DOT_COLOR[variant], dot && 'animate-pulse-soft')}
        />
      )}
      {props.children}
    </span>
  )
}

export function StatusBadge({ status }: { status: AppointmentStatusValue }) {
  const variant: BadgeProps['variant'] =
    status === AppointmentStatus.Pending
      ? 'warning'
      : status === AppointmentStatus.Confirmed
        ? 'primary'
        : status === AppointmentStatus.Completed
          ? 'success'
          : 'danger'
  return (
    <Badge variant={variant} dot>
      {STATUS_LABELS[status] ?? 'غير معروف'}
    </Badge>
  )
}