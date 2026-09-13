import { useMutation } from '@tanstack/react-query'
import { CalendarDays, Eye, EyeOff, HeartPulse, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../api/auth'
import { getApiError } from '../api/client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuthStore } from '../stores/auth'

const schema = z
  .object({
    fullName: z.string().min(3, 'الاسم 3 أحرف على الأقل'),
    email: z.string().email('بريد إلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
    confirmPassword: z.string(),
    dateOfBirth: z.string().min(1, 'أدخل تاريخ الميلاد'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: async (v: FormValues) => {
      await register({
        fullName: v.fullName,
        email: v.email,
        password: v.password,
        dateOfBirth: new Date(v.dateOfBirth + 'T00:00:00').toISOString(),
      })
      const tokens = await login({ email: v.email, password: v.password })
      setTokens(tokens)
    },
    onSuccess: () => navigate('/patient'),
    onError: (err) => setError(getApiError(err, 'فشل إنشاء الحساب')),
  })

  const onSubmit = handleSubmit((v) => {
    setError(null)
    mutation.mutate(v)
  })

  return (
    <div className="mx-auto mt-4 max-w-lg animate-fade-in-up">
      {/* Brand stripe */}
      <div className="rounded-t-3xl bg-gradient-to-l from-primary-600 to-primary-800 px-8 pb-8 pt-10 text-center text-white">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <HeartPulse className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-black">أنشئ حسابك كمريض</h1>
        <p className="mt-1 text-sm text-primary-100"> الخطوة الأولى نحو حجز موعدك </p>
      </div>

      {/* Form card */}
      <div className="rounded-b-3xl border border-t-0 border-neutral-200 bg-white px-8 py-8 shadow-xl shadow-neutral-200/50">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-danger-50 p-3.5 text-sm font-medium text-danger-600 ring-1 ring-danger-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-danger-400" />
              {error}
            </div>
          )}

          <Input
            label="الاسم الكامل"
            icon={<User className="h-4 w-4" />}
            error={errors.fullName?.message}
            placeholder="محمد أحمد"
            {...registerField('fullName')}
          />

          <Input
            label="البريد الإلكتروني"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            placeholder="name@example.com"
            {...registerField('email')}
          />

          <Input
            label="تاريخ الميلاد"
            type="date"
            icon={<CalendarDays className="h-4 w-4" />}
            error={errors.dateOfBirth?.message}
            {...registerField('dateOfBirth')}
          />

          <Input
            label="كلمة المرور"
            type={showPassword ? 'text' : 'password'}
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
            placeholder="6 أحرف على الأقل"
            {...registerField('password')}
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            placeholder="أعد كتابة كلمة المرور"
            {...registerField('confirmPassword')}
          />

          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
            إنشاء الحساب
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-500">
          عندك حساب بالفعل؟{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            سجل دخولك
          </Link>
        </p>
      </div>
    </div>
  )
}