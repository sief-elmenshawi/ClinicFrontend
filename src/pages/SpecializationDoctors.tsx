import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Stethoscope } from 'lucide-react'
import { getDoctorsBySpecialization } from '../api/doctors'
import { getSpecializations } from '../api/specializations'
import { getApiError } from '../api/client'
import { Spinner } from '../components/ui/spinner'
import { Avatar } from '../components/ui/avatar'

export function SpecializationDoctorsPage() {
  const { specializationId } = useParams()
  const id = Number(specializationId)

  const specQuery = useQuery({
    queryKey: ['specializations'],
    queryFn: () => getSpecializations(1, 50),
    select: (data) => data.items.find((s) => s.id === id),
  })

  const doctorsQuery = useQuery({
    queryKey: ['doctors', 'by-specialization', id],
    queryFn: () => getDoctorsBySpecialization(id),
    enabled: Number.isFinite(id),
  })

  if (doctorsQuery.isLoading) return <Spinner />
  if (doctorsQuery.error) return <p className="text-danger-600">{getApiError(doctorsQuery.error)}</p>

  const name = specQuery.data?.name ?? 'التخصص'
  const doctors = doctorsQuery.data ?? []

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-neutral-400">
        <Link to="/" className="font-medium text-neutral-500 transition-colors hover:text-primary-600">
          الرئيسية
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-bold text-neutral-800">{name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-l from-primary-50 to-white p-6 ring-1 ring-primary-100">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30">
          <Stethoscope className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-black text-neutral-900">أطباء {name}</h1>
          <p className="text-sm text-neutral-400">اختر طبيبك لعرض مواعيده المتاحة</p>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
          <Stethoscope className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
          <p className="font-medium text-neutral-500">لا يوجد أطباء في هذا التخصص حاليًا.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="group">
              <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50">
                <div className="flex items-center gap-3.5">
                  <Avatar name={doctor.fullName} size="lg" />
                  <div>
                    <p className="font-bold text-neutral-800 transition-colors group-hover:text-primary-700">
                      د. {doctor.fullName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-neutral-400">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {doctor.specializationName}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-success-50 px-3 py-1.5 text-sm font-black text-success-700 ring-1 ring-inset ring-success-100">
                  {doctor.consultationFee} ج
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}