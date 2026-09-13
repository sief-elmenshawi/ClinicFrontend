import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        {
          // primary → gradient
          'bg-gradient-to-l from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:brightness-110':
            variant === 'primary',
          'bg-neutral-800 text-white shadow-sm hover:bg-neutral-900': variant === 'secondary',
          'border border-neutral-300 bg-white text-neutral-700 shadow-sm hover:border-primary-300 hover:text-primary-700':
            variant === 'outline',
          'text-primary-700 hover:bg-primary-50': variant === 'ghost',
          'bg-gradient-to-l from-danger-500 to-danger-600 text-white shadow-lg shadow-danger-500/25 hover:brightness-110':
            variant === 'danger',
          'bg-primary-50 text-primary-700 hover:bg-primary-100': variant === 'soft',
        },
        {
          'h-8 rounded-lg px-3 text-xs': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-11 px-6 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'