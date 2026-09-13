import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ToastContext, type ToastType } from './use-toast'

interface Toast {
  id: number
  type: ToastType
  message: string
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success-400" />,
  error: <XCircle className="h-5 w-5 text-danger-400" />,
  info: <Info className="h-5 w-5 text-primary-400" />,
}

const RING: Record<ToastType, string> = {
  success: 'ring-success-400/40',
  error: 'ring-danger-400/40',
  info: 'ring-primary-400/40',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++counter.current
      setToasts((prev) => [...prev.slice(-3), { id, type, message }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <button
            key={t.id}
            role="status"
            aria-live="polite"
            onClick={() => dismiss(t.id)}
            className={cn(
              'pointer-events-auto flex w-full max-w-md animate-pop items-center gap-3 rounded-2xl',
              'bg-neutral-900/95 px-4 py-3 text-start text-sm font-medium text-white shadow-2xl',
              'backdrop-blur ring-1',
              RING[t.type],
            )}
          >
            {ICONS[t.type]}
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <X className="h-4 w-4 shrink-0 text-neutral-400" />
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}