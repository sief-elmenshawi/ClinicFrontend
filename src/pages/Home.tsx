import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  ChevronLeft,
  Clock,
  HeartPulse,
  Phone,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { getSpecializations } from '../api/specializations'
import { getApiError } from '../api/client'
import { Spinner } from '../components/ui/spinner'
import { Button } from '../components/ui/button'
import { useAuthStore } from '../stores/auth'

const SPEC_ICONS = [
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Users,
  CalendarCheck,
  Clock,
  Star,
  Phone,
]

const SPEC_GRADIENTS = [
  'from-primary-500 to-primary-700',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
]

export function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading, error } = useQuery({
    queryKey: ['specializations'],
    queryFn: () => getSpecializations(1, 50),
  })

  if (isLoading) return <Spinner />
  if (error) return <p className="text-danger-600">{getApiError(error)}</p>

  const specializations = data?.items ?? []

  return (
    <div className="space-y-14">
      {/* ── Hero ──────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-bl from-primary-700 via-primary-600 to-primary-800 px-8 py-14 text-white shadow-2xl shadow-primary-800/25 sm:px-12">
        {/* Decorative blobs */}
        <span className="pointer-events-none absolute -top-24 -end-12 h-72 w-72 rounded-full bg-white/10 blur-[2px] animate-float" />
        <span className="pointer-events-none absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-primary-400/20 blur-[2px] animate-float-delayed" />
        <span className="pointer-events-none top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative max-w-xl space-y-5 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            نظام حجز مواعيد العيادات
          </span>

          <h1 className="text-3xl font-black leading-snug sm:text-4xl lg:text-[2.75rem]">
            احجز موعدك مع
            <br />
            أفضل الأطباء في دقيقة واحدة
          </h1>

          <p className="max-w-md leading-relaxed text-primary-100">
            استعرض التخصصات، اختر طبيبك، وحدد الموعد المناسب لك — كل ده بضغطة زر.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            {!user && (
              <>
                <Button size="lg" onClick={() => navigate('/register')}
                  className="bg-white text-primary-800 shadow-xl shadow-primary-900/20 hover:bg-white/90">
                  أنشئ حسابك مجانًا
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  تسجيل الدخول
                </Button>
              </>
            )}
            {user && (
              <Button
                size="lg"
                className="bg-white text-primary-800 shadow-xl shadow-primary-900/20 hover:bg-white/90"
                onClick={() =>
                  navigate(user.role === 'Admin' ? '/admin' : user.role === 'Doctor' ? '/doctor' : '/patient')
                }
              >
                اذهب إلى لوحتي
              </Button>
            )}
          </div>

          {/* Stat pills */}
          <div className="grid max-w-md grid-cols-3 gap-3 pt-4">
            {[
              { value: `${specializations.length}+`, label: 'تخصص طبي' },
              { value: '30 د', label: 'متوسط الموعد' },
              { value: '24/7', label: 'حجز أونلاين' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/[0.12] px-3 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-black">{s.value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-primary-100">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features strip ────────────────────── */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Stethoscope, text: 'أطباء متخصصون', color: 'text-primary-600' },
          { icon: Clock, text: 'حجز سريع', color: 'text-emerald-600' },
          { icon: ShieldCheck, text: 'آمن وموثوق', color: 'text-violet-600' },
          { icon: Star, text: 'تقييمات حقيقية', color: 'text-amber-600' },
        ].map((f) => (
          <div
            key={f.text}
            className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <f.icon className={`h-6 w-6 ${f.color}`} />
            <span className="text-xs font-bold text-neutral-700">{f.text}</span>
          </div>
        ))}
      </section>

      {/* ── Specializations ───────────────────── */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black text-neutral-900">التخصصات المتاحة</h2>
            <p className="mt-0.5 text-sm text-neutral-400">اختر التخصص المناسب لحالتك</p>
          </div>
          <span className="hidden rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600 sm:inline-block">
            {specializations.length} تخصص
          </span>
        </div>

        {specializations.length === 0 ? (
          <div className="rounded-2xl bg-neutral-100 p-12 text-center">
            <p className="font-medium text-neutral-500">لا توجد تخصصات متاحة حاليًا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specializations.map((spec, i) => {
              const Icon = SPEC_ICONS[i % SPEC_ICONS.length]
              const gradient = SPEC_GRADIENTS[i % SPEC_GRADIENTS.length]
              return (
                <Link key={spec.id} to={`/specializations/${spec.id}`} className="group">
                  <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${gradient} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[15px] font-bold text-neutral-800">{spec.name}</span>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-neutral-300 transition-all group-hover:-translate-x-1 group-hover:text-primary-500" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── CTA footer ────────────────────────── */}
      {!user && (
        <section className="rounded-[2rem] bg-gradient-to-bl from-primary-50 via-primary-100/60 to-primary-50 p-10 text-center ring-1 ring-primary-200/60">
          <h3 className="text-xl font-black text-neutral-900">جاهز تبدأ؟</h3>
          <p className="mt-2 text-sm text-neutral-500">أنشئ حسابك كمريض وابدأ في الحجز الآن.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/register')}>
              إنشاء حساب مجاني
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              تسجيل الدخول
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}