import { format } from 'date-fns'
import { CalendarCheck2, CalendarClock, CheckCircle2, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeAppointment, getDoctorAppointments } from '../../api/appointments'
import { getApiError } from '../../api/client'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { FullPageSpinner } from '../../components/ui/spinner'
import { StatusBadge } from '../../components/ui/badge'
import { Avatar } from '../../components/ui/avatar'
import { useToast } from '../../components/ui/use-toast'
import { AppointmentStatus } from '../../types'
import { useCurrentDoctor } from '../../hooks/useCurrentDoctor'

const DAYS = 7
const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export function DoctorSchedulePage() {
  const { data: doctor, isLoading: loadingDoctor, isError } = useCurrentDoctor()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<string>(format(today, 'yyyy-MM-dd'))

  const dates = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date()
    d.setDate(today.getDate() + i)
    return d
  })

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'doctor', doctor?.id, selectedDate],
    queryFn: () => getDoctorAppointments(doctor!.id, selectedDate, 1, 100),
    enabled: doctor !== undefined,
  })

  const complete = useMutation({
    mutationFn: completeAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', 'doctor', doctor?.id, selectedDate],
      })
      toast('تم تأكيد الكشف وإتمام الحجز')
    },
    onError: (err) => toast(getApiError(err, 'فشل إتمام الحجز'), 'error'),
  })

  if (loadingDoctor || isLoading) return <FullPageSpinner />
  if (isError || !doctor) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-danger-50 p-10 text-center ring-1 ring-inset ring-danger-100">
        <Stethoscope className="h-8 w-8 text-danger-400" />
        <p className="text-sm font-medium text-danger-600">
          لا يوجد بروفايل طبيب مرتبط بهذا الحساب. تواصل مع الأدمن.
        </p>
      </div>
    )
  }

  const items = appointments ?? []
  const activeCount = items.filter(
    (a) => a.status === AppointmentStatus.Pending || a.status === AppointmentStatus.Confirmed,
  ).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">جدول الحجوزات</h1>
          <p className="mt-0.5 text-sm text-neutral-400">مرحبًا، د. {doctor.fullName}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-bold text-primary-700 ring-1 ring-inset ring-primary-100">
          <CalendarCheck2 className="h-4 w-4" />
          {activeCount} موعد نشط
        </span>
      </div>

      {/* Date strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dates.map((d, i) => {
          const key = format(d, 'yyyy-MM-dd')
          const active = key === selectedDate
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
                {i === 0 ? 'اليوم' : AR_DAYS[d.getDay()]}
              </div>
              <div className={`text-xs ${active ? 'opacity-80 text-white' : 'text-neutral-400'}`}>
                {format(d, 'd/M')}
              </div>
            </button>
          )
        })}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <CalendarClock className="h-7 w-7" />
            </span>
            <p className="font-bold text-neutral-700">لا توجد حجوزات في هذا اليوم</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  {/* Time chip */}
                  <span className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
                    <span className="text-sm font-black">
                      {format(new Date(appointment.appointmentDateTime), 'HH:mm')}
                    </span>
                  </span>

                  <Avatar name={appointment.patientName} size="md" />
                  <div>
                    <p className="font-bold text-neutral-900">{appointment.patientName}</p>
                    <p className="text-xs font-medium text-neutral-400">مريض</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={appointment.status} />
                  {(appointment.status === AppointmentStatus.Pending ||
                    appointment.status === AppointmentStatus.Confirmed) && (
                    <Button
                      size="sm"
                      loading={complete.isPending}
                      onClick={() => complete.mutate(appointment.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      تم الكشف
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}