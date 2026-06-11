import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfile, useUpdateProfile } from '@/features/settings/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  hourly_wage: z.number().positive('시급은 0보다 커야 합니다').max(1000000),
  pay_day: z.number().int().min(1, '1 이상이어야 합니다').max(28, '28 이하여야 합니다'),
  weekly_holiday_pay: z.boolean(),
  tax_type: z.enum(['none', '3.3', 'insurance']),
})

type FormValues = z.infer<typeof schema>

export default function SettingsForm() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useProfile()
  const { mutate, isPending } = useUpdateProfile()
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { weekly_holiday_pay: false, tax_type: 'none' },
  })

  const weeklyHolidayPay = watch('weekly_holiday_pay')
  const taxType = watch('tax_type')

  useEffect(() => {
    if (profile) {
      reset({
        hourly_wage: profile.hourly_wage,
        pay_day: profile.pay_day,
        weekly_holiday_pay: profile.weekly_holiday_pay ?? false,
        tax_type: profile.tax_type ?? 'none',
      })
    }
  }, [profile, reset])

  if (isLoading) return <div className="h-40 animate-pulse rounded-lg bg-muted" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>급여 설정</CardTitle>
        <CardDescription>시급, 급여일, 수당 및 세금을 설정하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v) =>
            mutate(v, {
              onSuccess: () => { toast.success('설정이 저장됐습니다'); navigate('/') },
              onError: () => toast.error('저장에 실패했습니다'),
            })
          )}
          className="space-y-6"
        >
          {/* 시급 */}
          <div className="space-y-1">
            <Label htmlFor="hourly_wage">시급 (원)</Label>
            <Input
              id="hourly_wage"
              type="number"
              step="10"
              {...register('hourly_wage', { valueAsNumber: true })}
            />
            {errors.hourly_wage && <p className="text-xs text-destructive">{errors.hourly_wage.message}</p>}
          </div>

          {/* 급여일 */}
          <div className="space-y-1">
            <Label htmlFor="pay_day">급여일 (매월 며칠)</Label>
            <Input id="pay_day" type="number" min={1} max={28} {...register('pay_day', { valueAsNumber: true })} />
            <p className="text-xs text-muted-foreground">이번 달 근무분은 다음 달 이 날짜에 지급됩니다</p>
            {errors.pay_day && <p className="text-xs text-destructive">{errors.pay_day.message}</p>}
          </div>

          {/* 주휴수당 */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">주휴수당</p>
              <p className="text-xs text-muted-foreground">주 15시간 이상 근무 시 (주당시간 ÷ 40) × 8 × 시급</p>
            </div>
            <button
              type="button"
              onClick={() => setValue('weekly_holiday_pay', !weeklyHolidayPay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                weeklyHolidayPay ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  weeklyHolidayPay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 세금 */}
          <div className="space-y-2">
            <Label>세금 공제</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'none', label: '없음', desc: '세전 금액' },
                { value: '3.3', label: '3.3%', desc: '원천징수' },
                { value: 'insurance', label: '4대보험', desc: '약 8.94%' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('tax_type', opt.value)}
                  className={`flex flex-col items-center rounded-lg border p-3 text-sm transition-colors ${
                    taxType === opt.value
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? '저장 중...' : '저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
