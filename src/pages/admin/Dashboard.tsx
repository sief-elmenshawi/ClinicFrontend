import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, HeartPulse, Settings2, ShieldCheck, Sparkles, Stethoscope, Tags } from 'lucide-react'
import { getAllDoctors } from '../../api/doctors'
import { getSpecializations } from '../../api/specializations'
import { getApiError } from '../../api/client'
import { FullPageSpinner } from '../../components/ui/spinner'
import { useAuthStore } from '../../stores/auth'

export function DashboardPage() {
  const email = useAuthStore((s) => s.user?.email)

  const specs = useQuery({
    queryKey: ['specializations'],
    queryFn: () => getSpecializations(1, 1),
  })
  const doctors = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: () => getAllDoctors(1, 1),
  })

  if (specs.isLoading || doctors.isLoading) return <FullPageSpinner />
  if (specs.error || doctors.error) {
    return <p className="text-danger-600">{getApiError(specs.error ?? doctors.error)}</p>
  }

  const stats = [
    {
      label: 'التخصصات',
      value: specs.data?.totalCount ?? 0,
      icon: Tags,
      to: '/admin/specializations',
      gradient: 'from-primary-500 to-primary-700',
      shadow: 'shadow-primary-500/30',
      note: 'ادارة الأقسام الطبية',
    },
    {
      label: 'الأطباء',
      value: doctors.data?.totalCount ?? 0,
      icon: Stethoscope,
      to: '/admin/doctors',
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/30',
      note: 'ادارة الكوادر الطبية',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-primary-700 via-primary-600 to-primary-900 p-8 text-white shadow-xl shadow-primary-800/20">
        <span className="pointer-events-none absolute -top-16 -end-10 h-48 w-48 rounded-full bg-white/10 animate-float" />
        <span className="pointer-events-none absolute -bottom-16 -start-10 h-40 w-40 rounded-full bg-primary-400/20 animate-float-delayed" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            لوحة التحكم
          </span>
          <h1 className="mt-3 text-2xl font-black">أهلًا بك، {email?.split('@')[0] ?? 'أدمن'}</h1>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-primary-100">
            تابع كل ما يخص العيادة: الأطباء، التخصصات، وساعات العمل من مكان واحد.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/50">
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${s.gradient} ${s.shadow} transition-transform group-hover:scale-105`}
                >
                  <s.icon className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-3xl font-black text-neutral-900">{s.value}</p>
                  <p className="font-bold text-neutral-700">{s.label}</p>
                  <p className="text-xs font-medium text-neutral-400">{s.note}</p>
                </div>
              </div>
              <ArrowLeft className="h-5 w-5 text-neutral-300 transition-all group-hover:-translate-x-1 group-hover:text-primary-500" />
            </div>
          </Link>
        ))}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-black text-neutral-900">
          <Settings2 className="h-5 w-5 text-primary-600" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              title: 'إضافة طبيب جديد',
              desc: 'أنشئ حساب طبيب وحدد تخصصه ورسوم الكشف',
              to: '/admin/doctors',
              icon: Stethoscope,
            },
            {
              title: 'إضافة تخصص طبي',
              desc: 'وسّع نطاق خدمات العيادة بتخصص جديد',
              to: '/admin/specializations',
              icon: Tags,
            },
          ].map((a) => (
            <Link key={a.title} to={a.to} className="group">
              <div className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <a.icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="font-bold text-neutral-800">{a.title}</p>
                  <p className="text-xs text-neutral-400">{a.desc}</p>
                </div>
                <ArrowLeft className="h-4 w-4 text-neutral-300 transition-all group-hover:-translate-x-1 group-hover:text-primary-500" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust badge */}
      <div className="flex items-center gap-3 rounded-2xl bg-success-50 p-4 ring-1 ring-inset ring-success-100">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-success-600 shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <p className="text-sm font-bold text-success-700">
          النظام محمي — جميع العمليات الحسّاسة تحت المراقبة والتوثيق.
        </p>
        <HeartPulse className="ms-auto h-5 w-5 text-success-500/60" />
      </div>
    </div>
  )
}