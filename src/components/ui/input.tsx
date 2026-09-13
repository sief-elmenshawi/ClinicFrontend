import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-neutral-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 shadow-sm transition-all duration-200',
              'placeholder:text-neutral-400',
              'hover:border-neutral-300',
              'focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/15',
              error && 'border-danger-400 focus:border-danger-400 focus:ring-danger-500/15',
              icon && 'pe-10',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'