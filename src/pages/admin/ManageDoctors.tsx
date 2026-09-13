import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  CalendarOff,
  ChevronDown,
  Clock,
  Plus,
  Trash2,
  UserRoundPlus,
  Wallet,
} from 'lucide-react'
import {
  addUnavailability,
  addWorkingHour,
  createDoctor,
  deleteDoctor,
  getAllDoctors,
} from '../../api/doctors'
import { getSpecializations } from '../../api/specializations'
import { getApiError } from '../../api/client'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Avatar } from '../../components/ui/avatar'
import { FullPageSpinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/use-toast'

const DAY_OPTIONS = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
]

const SELECT_CLASS =
  'h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 pe-9 text-sm text-neutral-800 shadow-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/15 appearance-none'

export function ManageDoctorsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const specsQuery = useQuery({
    queryKey: ['specializations'],
    queryFn: () => getSpecializations(1, 50),
  })

  const doctorsQuery = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: () => getAllDoctors(1, 100),
  })

  const invalidateDoctors = () => {
    queryClient.invalidateQueries({ queryKey: ['doctors', 'all'] })
    queryClient.invalidateQueries({ queryKey: ['slots'] })
  }

  // ── Create Doctor ─────────────────────────────
  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    email: '',
    password: '',
    specializationId: '',
    consultationFee: '',
  })
  const [createError, setCreateError] = useState<string | null>(null)

  const createDoctorMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      invalidateDoctors()
      setDoctorForm({ fullName: '', email: '', password: '', specializationId: '', consultationFee: '' })
      setCreateError(null)
      toast('تمت إضافة الطبيب بنجاح')
    },
    onError: (err) => setCreateError(getApiError(err, 'فشل إضافة الطبيب')),
  })

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault()
    createDoctorMutation.mutate({
      fullName: doctorForm.fullName,
      email: doctorForm.email,
      password: doctorForm.password,
      specializationId: Number(doctorForm.specializationId),
      consultationFee: Number(doctorForm.consultationFee),
    })
  }

  // ── Working hours / Unavailability / Delete ───
  const [activeDoctor, setActiveDoctor] = useState<number | null>(null)
  const [hourForm, setHourForm] = useState({ dayOfWeek: '0', startTime: '09:00', endTime: '17:00', slotDurationMinutes: '30' })
  const [unavailForm, setUnavailForm] = useState({ date: '', reason: '' })

  const deleteMutation = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      invalidateDoctors()
      toast('تم حذف الطبيب')
    },
    onError: (err) => toast(getApiError(err, 'فشل حذف الطبيب'), 'error'),
  })

  const workingHourMutation = useMutation({
    mutationFn: addWorkingHour,
    onSuccess: () => toast('تمت إضافة ساعات العمل'),
    onError: (err) => toast(getApiError(err, 'فشل إضافة ساعات العمل'), 'error'),
  })

  const unavailMutation = useMutation({
    mutationFn: addUnavailability,
    onSuccess: () => {
      toast('تم تسجيل الإجازة')
      setUnavailForm({ date: '', reason: '' })
    },
    onError: (err) => toast(getApiError(err, 'فشل تسجيل الإجازة'), 'error'),
  })

  if (specsQuery.isLoading || doctorsQuery.isLoading) return <FullPageSpinner />

  const specializations = specsQuery.data?.items ?? []
  const doctors = doctorsQuery.data?.items ?? []

  const toggleDoctor = (id: number) => {
    setActiveDoctor((cur) => (cur === id ? null : id))
    setHourForm({ dayOfWeek: '0', startTime: '09:00', endTime: '17:00', slotDurationMinutes: '30' })
    setUnavailForm({ date: '', reason: '' })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900">
          <UserRoundPlus className="h-6 w-6 text-primary-600" />
          إدارة الأطباء
        </h1>
        <p className="mt-0.5 text-sm text-neutral-400">
          أضف أطباء جدد وحدد ساعات العمل والإجازات لكل طبيب
        </p>
      </div>

      {createError && (
        <div className="rounded-xl bg-danger-50 p-3.5 text-sm font-medium text-danger-600 ring-1 ring-inset ring-danger-100">
          {createError}
        </div>
      )}

      {/* Create doctor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Plus className="h-5 w-5" />
            </span>
            إضافة طبيب جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateDoctor}
            className="grid grid-cols-1 gap-4 rounded-2xl bg-neutral-50/60 p-5 sm:grid-cols-2 lg:grid-cols-3 ring-1 ring-inset ring-neutral-100"
          >
            <Input
              label="الاسم الكامل"
              value={doctorForm.fullName}
              onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
              placeholder="د. أحمد محمد"
              required
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={doctorForm.email}
              onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
              placeholder="doctor@clinic.com"
              required
            />
            <Input
              label="كلمة المرور"
              type="password"
              value={doctorForm.password}
              onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
              placeholder="••••••••"
              required
            />
            <label className="space-y-1.5">
              <span className="block text-sm font-semibold text-neutral-700">التخصص</span>
              <div className="relative">
                <select
                  className={SELECT_CLASS}
                  value={doctorForm.specializationId}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specializationId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    اختر التخصص
                  </option>
                  {specializations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-neutral-400" />
              </div>
            </label>
            <Input
              label="رسوم الكشف (ج)"
              type="number"
              min={0}
              icon={<Wallet className="h-4 w-4" />}
              value={doctorForm.consultationFee}
              onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
              placeholder="200"
              required
            />
            <div className="flex items-end">
              <Button type="submit" className="w-full" loading={createDoctorMutation.isPending}>
                <Plus className="h-4 w-4" />
                إضافة الطبيب
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Doctor list */}
      <div className="space-y-3">
        <span className="text-sm font-bold text-neutral-500">الأطباء ({doctors.length})</span>
        {doctors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <p className="text-sm font-medium text-neutral-400">لا يوجد أطباء بعد.</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={doctor.fullName} size="lg" />
                    <div>
                      <p className="font-bold text-neutral-900">د. {doctor.fullName}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-400">
                        <span>{doctor.specializationName}</span>
                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                        <span className="font-bold text-success-600">{doctor.consultationFee} ج</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleDoctor(doctor.id)}
                    >
                      <Clock className="h-4 w-4" />
                      ساعات العمل
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${activeDoctor === doctor.id ? 'rotate-180' : ''}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`هل تريد حذف د. ${doctor.fullName}؟`)) {
                          deleteMutation.mutate(doctor.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>

                {activeDoctor === doctor.id && (
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-neutral-100 pt-5 lg:grid-cols-2 animate-fade-in">
                    {/* Working hours */}
                    <div className="space-y-3 rounded-2xl bg-neutral-50/60 p-5 ring-1 ring-inset ring-neutral-100">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Clock className="h-4 w-4" />
                        </span>
                        إضافة ساعات عمل
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="space-y-1.5">
                          <span className="block text-xs font-semibold text-neutral-700">اليوم</span>
                          <div className="relative">
                            <select
                              className={SELECT_CLASS + ' h-9'}
                              value={hourForm.dayOfWeek}
                              onChange={(e) => setHourForm({ ...hourForm, dayOfWeek: e.target.value })}
                            >
                              {DAY_OPTIONS.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-neutral-400" />
                          </div>
                        </label>
                        <label className="space-y-1.5">
                          <span className="block text-xs font-semibold text-neutral-700">مدة الموعد (دقيقة)</span>
                          <input
                            type="number"
                            min={5}
                            className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm shadow-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/15"
                            value={hourForm.slotDurationMinutes}
                            onChange={(e) => setHourForm({ ...hourForm, slotDurationMinutes: e.target.value })}
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="block text-xs font-semibold text-neutral-700">البداية</span>
                          <input
                            type="time"
                            className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm shadow-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/15"
                            value={hourForm.startTime}
                            onChange={(e) => setHourForm({ ...hourForm, startTime: e.target.value })}
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="block text-xs font-semibold text-neutral-700">النهاية</span>
                          <input
                            type="time"
                            className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm shadow-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/15"
                            value={hourForm.endTime}
                            onChange={(e) => setHourForm({ ...hourForm, endTime: e.target.value })}
                          />
                        </label>
                      </div>
                      <Button
                        size="sm"
                        loading={workingHourMutation.isPending}
                        onClick={() =>
                          workingHourMutation.mutate({
                            doctorId: doctor.id,
                            dayOfWeek: Number(hourForm.dayOfWeek),
                            startTime: hourForm.startTime + ':00',
                            endTime: hourForm.endTime + ':00',
                            slotDurationMinutes: Number(hourForm.slotDurationMinutes),
                          })
                        }
                      >
                        حفظ ساعات العمل
                      </Button>
                    </div>

                    {/* Unavailability */}
                    <div className="space-y-3 rounded-2xl bg-danger-50/40 p-5 ring-1 ring-inset ring-danger-100">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-danger-500 shadow-sm">
                          <CalendarOff className="h-4 w-4" />
                        </span>
                        إجازة الطبيب
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="space-y-1.5">
                          <span className="block text-xs font-semibold text-neutral-700">التاريخ</span>
                          <input
                            type="date"
                            className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm shadow-sm transition-all focus:border-danger-400 focus:outline-none focus:ring-4 focus:ring-danger-500/15"
                            value={unavailForm.date}
                            onChange={(e) => setUnavailForm({ ...unavailForm, date: e.target.value })}
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="block text-xs font-semibold text-neutral-700">السبب (اختياري)</span>
                          <input
                            className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm shadow-sm transition-all focus:border-danger-400 focus:outline-none focus:ring-4 focus:ring-danger-500/15"
                            value={unavailForm.reason}
                            onChange={(e) => setUnavailForm({ ...unavailForm, reason: e.target.value })}
                          />
                        </label>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={unavailMutation.isPending}
                        disabled={!unavailForm.date}
                        onClick={() =>
                          unavailMutation.mutate({
                            doctorId: doctor.id,
                            date: unavailForm.date,
                            reason: unavailForm.reason || null,
                          })
                        }
                      >
                        تسجيل إجازة
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}