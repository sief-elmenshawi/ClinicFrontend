import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Tags } from 'lucide-react'
import { getApiError } from '../../api/client'
import { createSpecialization, getSpecializations } from '../../api/specializations'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { FullPageSpinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/use-toast'

const GRADIENTS = [
  'from-primary-500 to-primary-700',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
]

export function ManageSpecializationsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['specializations'],
    queryFn: () => getSpecializations(1, 50),
  })

  const create = useMutation({
    mutationFn: createSpecialization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] })
      setName('')
      setError(null)
      toast('تمت إضافة التخصص بنجاح')
    },
    onError: (err) => setError(getApiError(err, 'فشل إضافة التخصص')),
  })

  if (isLoading) return <FullPageSpinner />

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900">
          <Tags className="h-6 w-6 text-primary-600" />
          التخصصات الطبية
        </h1>
        <p className="mt-0.5 text-sm text-neutral-400">
          أضف وادارة التخصصات المتاحة في العيادة
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-neutral-900">إضافة تخصص جديد</h2>
              <p className="text-xs text-neutral-400">مثال: قلب وأوعية دموية، عظام، أسنان</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-danger-50 p-3.5 text-sm font-medium text-danger-600 ring-1 ring-inset ring-danger-100">
              {error}
            </div>
          )}

          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate({ name })
            }}
          >
            <Input
              label="اسم التخصص"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: قلب وأوعية دموية"
              className="sm:max-w-96"
            />
            <Button type="submit" loading={create.isPending} disabled={!name.trim()}>
              <Plus className="h-4 w-4" />
              إضافة التخصص
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.items ?? []).map((spec, i) => (
          <div
            key={spec.id}
            className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${GRADIENTS[i % GRADIENTS.length]}`}
            >
              <Tags className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-neutral-800">{spec.name}</p>
              <p className="text-xs font-medium text-neutral-400">رقم {spec.id}</p>
            </div>
          </div>
        ))}
      </div>

      {(data?.items ?? []).length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
          <Tags className="mx-auto mb-2 h-7 w-7 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-400">لا توجد تخصصات بعد. أضف أول تخصص.</p>
        </div>
      )}
    </div>
  )
}