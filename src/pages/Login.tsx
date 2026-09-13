import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, HeartPulse, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { getApiError } from '../api/client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuthStore } from '../stores/auth'

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (tokens) => {
      setTokens(tokens)
      const role = tokens.accessToken ? decodeRole(tokens.accessToken) : undefined
      navigate(role === 'Admin' ? '/admin' : role === 'Doctor' ? '/doctor' : '/patient')
    },
    onError: (err) => setError(getApiError(err, 'فشل تسجيل الدخول')),
  })

  return (
    <div className="mx-auto mt-4 max-w-lg animate-fade-in-up">
      {/* Brand stripe */}
      <div className="rounded-t-3xl bg-gradient-to-l from-primary-600 to-primary-800 px-8 pb-8 pt-10 text-center text-white">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <HeartPulse className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-black">مرحبًا بعودتك</h1>
        <p className="mt-1 text-sm text-primary-100">سجّل دخولك للمتابعة إلى حسابك</p>
      </div>

      {/* Form card */}
      <div className="rounded-b-3xl border border-t-0 border-neutral-200 bg-white px-8 py-8 shadow-xl shadow-neutral-200/50">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-danger-50 p-3.5 text-sm font-medium text-danger-600 ring-1 ring-danger-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-danger-400" />
              {error}
            </div>
          )}

          <Input
            label="البريد الإلكتروني"
            type="email"
            autoComplete="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            placeholder="name@example.com"
            {...register('email')}
          />

          <Input
            label="كلمة المرور"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            icon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            placeholder="••••••••"
            {...register('password')}
          />

          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
            تسجيل الدخول
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary-50/60 py-2.5 text-xs font-medium text-primary-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          محمي بمعدل 5 محاولات لكل دقيقة
        </div>

        <p className="mt-5 text-center text-sm text-neutral-500">
          مش عندك حساب؟{' '}
          <Link
            to="/register"
            className="font-bold text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            أنشئ حساب مريض
          </Link>
        </p>
      </div>
    </div>
  )
}

function decodeRole(token: string): string | undefined {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(
      decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      ),
    )
    return (
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? undefined
    )
  } catch {
    return undefined
  }
}