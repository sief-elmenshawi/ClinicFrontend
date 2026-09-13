import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarDays, ChevronRight, Clock, Star, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiError } from '../api/client'
import { getAvailableSlots, getDoctorsBySpecialization, getDoctorRatings } from '../api/doctors'
import { getCurrentPatient } from '../api/patients'
import { createAppointment } from '../api/appointments'
import { getSpecializations } from '../api/specializations'
import { Card, CardContent } from '../components/ui/card'
import { Spinner } from '../components/ui/spinner'
import { Avatar } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { useToast } from '../components/ui/use-toast'
import { useAuthStore } from '../stores/auth'

interface DoctorInfo {
  id: number
  fullName: string
  specializationName: string
  consultationFee: number
}

const DAYS_AHEAD = 14
const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export function DoctorProfilePage() {
  const { doctorId } = useParams()
  const id = Number(doctorId)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()

  const stateDoctor = (location.state as DoctorInfo | undefined) ?? null

  const fallbackQuery = useQuery({
    queryKey: ['doctors', 'by-specialization', -1],
    queryFn: async () => {
      const specs = await getSpecializations(1, 100)
      for (const spec of specs.items) {
        const doctors = await getDoctorsBySpecialization(spec.id)
        const found = doctors.find((d) => d.id === id)
        if (found) return found
      }
      return null
    },
    enabled: !stateDoctor && Number.isFinite(id),
  })

  const doctor: DoctorInfo | null =
    stateDoctor ?? (fallbackQuery.data as DoctorInfo | null) ?? null

  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<string>(format(today, 'yyyy-MM-dd'))

  const dates = useMemo(() => {
    return Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = new Date()
      d.setDate(today.getDate() + i)
      return d
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const slotsQuery = useQuery({
    queryKey: ['slots', id, selectedDate],
    queryFn: () => getAvailableSlots(id, selectedDate),
    enabled: Number.isFinite(id) && !!selectedDate,
  })

  const ratingsQuery = useQuery({
    queryKey: ['ratings', id],
    queryFn: () => getDoctorRatings(id),
    enabled: Number.isFinite(id),
  })

  const [waiting, setWaiting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  async function handleBook(startTime: string) {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'Patient') {
      toast('حساب المريض فقط يمكنه الحجز', 'error')
      return
    }
    setWaiting(true)
    setBookingId(startTime)
    try {
      const patient = await getCurrentPatient()
      const appointmentId = await createAppointment({
        doctorId: id,
        patientId: patient.id,
        appointmentDateTime: startTime,
      })
      toast(`تم حجز موعدك بنجاح برقم ${appointmentId}`)
    } catch (err) {
      toast(getApiError(err, 'فشل الحجز'), 'error')
    } finally {
      setWaiting(false)
      setBookingId(null)
    }
  }

  if (fallbackQuery.isFetching && !doctor) return <Spinner />

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-neutral-400">
        <Link to="/" className="font-medium text-neutral-500 transition-colors hover:text-primary-600">
          الرئيسية
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {doctor && (
          <>
            <span className="text-neutral-400">{doctor.specializationName}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="font-bold text-neutral-800">{doctor?.fullName ?? 'الطبيب'}</span>
      </nav>

      {/* Doctor hero */}
      {doctor && (
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-l from-primary-500 via-primary-600 to-primary-800" />
          <CardContent className="flex flex-wrap items-center justify-between gap-5 p-6">
            <div className="flex items-center gap-4">
              <Avatar name={doctor.fullName} size="lg" className="h-16 w-16 text-2xl" />
              <div>
                <h1 className="text-2xl font-black text-neutral-900">د. {doctor.fullName}</h1>
                <p className="mt-0.5 text-sm font-medium text-neutral-400">
                  {doctor.specializationName}
                </p>
              </div>
            </div>
            <div className="text-end">
              <p className="flex items-center justify-end gap-1.5 text-2xl font-black text-success-600">
                <Wallet className="h-5 w-5" />
                {doctor.consultationFee} ج
              </p>
              <p className="text-xs font-medium text-neutral-400">رسوم الكشف</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking card */}
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-black text-neutral-900">اختر موعدك</h2>
              <p className="text-xs text-neutral-400">
                {user?.role === 'Patient'
                  ? 'اضغط على الموعد لحجزه مباشرة'
                  : 'سجل دخولك كي تحجز'}
              </p>
            </div>
          </div>

          {/* Date strip */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((d, i) => {
              const key = format(d, 'yyyy-MM-dd')
              const active = key === selectedDate
              const isToday = i === 0
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={
                    active
                      ? 'shrink-0 rounded-2xl bg-gradient-to-l from-primary-500 to-primary-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30'
                      : 'shrink-0 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:border-primary-200 hover:bg-primary-50/50'
                  }
                >
                  <div className={active ? 'text-primary-100' : ''}>
                    {isToday ? 'اليوم' : AR_DAYS[d.getDay()]}
                  </div>
                  <div className={`text-xs ${active ? 'opacity-80 text-white' : 'text-neutral-400'}`}>
                    {format(d, 'd/M')}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Slots */}
          {slotsQuery.isLoading ? (
            <Spinner className="p-4" />
          ) : slotsQuery.error ? (
            <p className="rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-600">
              {getApiError(slotsQuery.error)}
            </p>
          ) : (slotsQuery.data?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center">
              <p className="text-sm font-medium text-neutral-400">لا توجد مواعيد متاحة في هذا اليوم.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {slotsQuery.data?.map((slot) => {
                const isBooking = bookingId === slot.startTime && waiting
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => handleBook(slot.startTime)}
                    disabled={waiting}
                    className="group flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50/60 px-3 py-2.5 text-sm font-bold text-primary-700 transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:text-white hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-60"
                  >
                    {isBooking ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent group-hover:border-white" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    {format(new Date(slot.startTime), 'HH:mm')}
                  </button>
                )
              })}
            </div>
          )}

          {!user && (
            <Button variant="soft" className="w-full" onClick={() => navigate('/login')}>
              سجل دخولك لتفعيل الحجز
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Ratings */}
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
              <Star className="h-5 w-5" />
            </span>
            <h2 className="font-black text-neutral-900">تقييمات المرضى</h2>
          </div>

          {ratingsQuery.isLoading ? (
            <Spinner className="p-4" />
          ) : ratingsQuery.data && ratingsQuery.data.totalRatings > 0 ? (
            <>
              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-l from-warning-50 to-white p-5 ring-1 ring-warning-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-warning-600 shadow-sm ring-1 ring-warning-100">
                  {ratingsQuery.data.averageScore.toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={
                          n <= Math.round(ratingsQuery.data.averageScore)
                            ? 'h-5 w-5 fill-warning-500 text-warning-500'
                            : 'h-5 w-5 text-neutral-300'
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-medium text-neutral-400">
                    بناءً على {ratingsQuery.data.totalRatings} تقييم
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {ratingsQuery.data.ratings.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 transition-colors hover:bg-neutral-100/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-800">{r.patientName}</span>
                      <span className="flex items-center gap-1 text-sm font-black text-warning-600">
                        {r.score}
                        <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
                      </span>
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{r.comment}</p>}
                    <p className="mt-2 text-[11px] font-medium text-neutral-400">
                      {format(new Date(r.createdAt), 'd/M/yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center">
              <Star className="mx-auto mb-2 h-6 w-6 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-400">لا توجد تقييمات بعد لهذا الطبيب.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}