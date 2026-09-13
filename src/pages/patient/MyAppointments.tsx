import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarClock, CalendarX2, NotebookPen, Star } from 'lucide-react'
import { useState } from 'react'
import {
  cancelAppointment,
  getPatientAppointments,
  rateDoctor,
  rescheduleAppointment,
} from '../../api/appointments'
import { getApiError } from '../../api/client'
import { Badge, StatusBadge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { FullPageSpinner } from '../../components/ui/spinner'
import { Input } from '../../components/ui/input'
import { Avatar } from '../../components/ui/avatar'
import { useToast } from '../../components/ui/use-toast'
import { STATUS_ACCENT, STATUS_LABELS } from '../../lib/status'
import { useCurrentPatient } from '../../hooks/useCurrentPatient'
import { AppointmentStatus, type AppointmentStatusValue } from '../../types'

export function MyAppointmentsPage() {
  const { data: patient, isLoading: loadingPatient } = useCurrentPatient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'patient', patient?.id],
    queryFn: () => getPatientAppointments(patient!.id),
    enabled: patient !== undefined,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] })

  const cancel = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      invalidate()
      toast('تم إلغاء الحجز بنجاح')
    },
    onError: (err) => toast(getApiError(err, 'فشل إلغاء الحجز'), 'error'),
  })

  const [reschedulingId, setReschedulingId] = useState<number | null>(null)
  const [newDateTime, setNewDateTime] = useState('')
  const [ratingId, setRatingId] = useState<number | null>(null)
  const [score, setScore] = useState(5)
  const [comment, setComment] = useState('')

  const reschedule = useMutation({
    mutationFn: rescheduleAppointment,
    onSuccess: () => {
      invalidate()
      setReschedulingId(null)
      setNewDateTime('')
      toast('تم تأجيل الموعد بنجاح')
    },
    onError: (err) => toast(getApiError(err, 'فشل تغيير الموعد'), 'error'),
  })

  const rate = useMutation({
    mutationFn: rateDoctor,
    onSuccess: () => {
      invalidate()
      setRatingId(null)
      setComment('')
      toast('شكرًا لك! تم إرسال تقييمك')
    },
    onError: (err) => toast(getApiError(err, 'فشل إرسال التقييم'), 'error'),
  })

  if (loadingPatient || isLoading) return <FullPageSpinner />

  if (!patient) {
    return <p className="text-danger-600">لم يتم العثور على بروفايل المريض.</p>
  }

  const items = appointments ?? []

  const actionable = (status: AppointmentStatusValue) =>
    status === AppointmentStatus.Pending || status === AppointmentStatus.Confirmed

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-neutral-900">حجوزاتي</h1>
        <p className="mt-0.5 text-sm text-neutral-400">تابع مواعيدك ويمكنك تأجيلها أو تقييم طبيبك</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <CalendarClock className="h-7 w-7" />
            </span>
            <p className="font-bold text-neutral-700">لا توجد حجوزات حاليًا</p>
            <p className="text-sm text-neutral-400">ابدأ باختيار تخصص وطبيب واحجز موعدك</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((appointment) => (
            <Card
              key={appointment.id}
              className={`border-s-4 ${STATUS_ACCENT[appointment.status] ?? 'border-neutral-200'}`}
            >
              <CardContent className="p-5">
                {/* Row 1: doctor + status */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={appointment.doctorName} size="md" />
                    <div>
                      <p className="font-bold text-neutral-900">{appointment.doctorName}</p>
                      <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
                        <CalendarClock className="h-3.5 w-3.5 text-primary-500" />
                        {format(new Date(appointment.appointmentDateTime), 'EEEE d/M/yyyy')} —{' '}
                        {format(new Date(appointment.appointmentDateTime), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>

                {appointment.notes && (
                  <p className="mt-3 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
                    {appointment.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {actionable(appointment.status) && (
                    <>
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => {
                          setReschedulingId(reschedulingId === appointment.id ? null : appointment.id)
                          setRatingId(null)
                        }}
                      >
                        <CalendarX2 className="h-4 w-4" />
                        تأجيل الموعد
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancel.isPending}
                        onClick={() => cancel.mutate(appointment.id)}
                      >
                        إلغاء الحجز
                      </Button>
                    </>
                  )}

                  {appointment.status === AppointmentStatus.Completed && (
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => {
                        setRatingId(ratingId === appointment.id ? null : appointment.id)
                        setReschedulingId(null)
                      }}
                    >
                      <Star className="h-4 w-4 text-warning-500" />
                      تقييم الطبيب
                    </Button>
                  )}

                  {appointment.status === AppointmentStatus.Cancelled && (
                    <Badge variant="danger">{STATUS_LABELS[AppointmentStatus.Cancelled]}</Badge>
                  )}
                </div>

                {/* Reschedule inline */}
                {reschedulingId === appointment.id && (
                  <div className="mt-4 animate-pop flex flex-wrap items-end gap-3 rounded-2xl bg-primary-50/50 p-4 ring-1 ring-inset ring-primary-100">
                    <Input
                      label="الموعد الجديد"
                      type="datetime-local"
                      value={newDateTime}
                      onChange={(e) => setNewDateTime(e.target.value)}
                      className="max-w-64"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={reschedule.isPending}
                        onClick={() =>
                          reschedule.mutate({
                            appointmentId: appointment.id,
                            newDateTime: new Date(newDateTime + ':00').toISOString(),
                          })
                        }
                        disabled={!newDateTime}
                      >
                        تأكيد التأجيل
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReschedulingId(null)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rating inline */}
                {ratingId === appointment.id && (
                  <div className="mt-4 animate-pop space-y-3 rounded-2xl bg-warning-50/50 p-4 ring-1 ring-inset ring-warning-100">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setScore(n)}
                          className="transition-transform hover:scale-110"
                          aria-label={`${n} نجوم`}
                        >
                          <Star
                            className={
                              n <= score
                                ? 'h-7 w-7 fill-warning-500 text-warning-500'
                                : 'h-7 w-7 text-neutral-300'
                            }
                          />
                        </button>
                      ))}
                      <span className="ms-2 text-sm font-bold text-warning-700">{score} من 5</span>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="أضف تعليقك (اختياري)"
                      rows={2}
                      className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-sm transition-colors focus:border-warning-400 focus:outline-none focus:ring-4 focus:ring-warning-500/15"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={rate.isPending}
                        onClick={() =>
                          rate.mutate({
                            appointmentId: appointment.id,
                            score,
                            comment: comment || null,
                          })
                        }
                      >
                        <NotebookPen className="h-4 w-4" />
                        إرسال التقييم
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRatingId(null)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}