import { HeartPulse } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-10', className)}>
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary-200/60" />
        <span className="absolute inset-2 animate-pulse-soft rounded-full bg-primary-100" />
        <HeartPulse className="relative h-6 w-6 animate-pulse-soft text-primary-600" />
      </div>
    </div>
  )
}

export function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary-200/60" />
        <span className="absolute inset-2 animate-pulse-soft rounded-full bg-primary-100" />
        <HeartPulse className="relative h-7 w-7 animate-pulse-soft text-primary-600" />
      </div>
      {message && <p className="text-sm font-medium text-neutral-500">{message}</p>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer animate-shimmer rounded-xl', className)} />
}