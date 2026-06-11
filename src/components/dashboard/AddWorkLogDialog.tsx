import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/features/auth/store'
import { useAddWorkLog } from '@/features/work-logs/hooks'
import { calculateHours, calculateDailyEarnings } from '@/features/work-logs/utils'
import { formatCurrency, formatHours } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z
  .object({
    work_date: z.string().min(1, '날짜를 선택해주세요'),
    start_time: z.string().min(1, '시작 시간을 입력해주세요'),
    end_time: z.string().min(1, '종료 시간을 입력해주세요'),
    memo: z.string().optional(),
  })
  .refine((d) => d.start_time < d.end_time, {
    message: '종료 시간은 시작 시간보다 늦어야 합니다',
    path: ['end_time'],
  })

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  initialDate?: string
  hourlyWage: number
}

export default function AddWorkLogDialog({ open, onClose, initialDate, hourlyWage }: Props) {
  const userId = useAuthStore((s) => s.user?.id)
  const { mutate, isPending } = useAddWorkLog()
  const [preview, setPreview] = useState<{ hours: number; earnings: number } | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { work_date: initialDate ?? today },
  })

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  useEffect(() => {
    if (startTime && endTime && startTime < endTime) {
      const hours = calculateHours(startTime, endTime)
      const earnings = calculateDailyEarnings(hours, hourlyWage)
      setPreview({ hours, earnings })
    } else {
      setPreview(null)
    }
  }, [startTime, endTime, hourlyWage])

  useEffect(() => {
    if (!open) return
    reset({ work_date: initialDate ?? today, start_time: '', end_time: '', memo: '' })
    setPreview(null)
    // open 전환 시에만 초기화 — reset/today/initialDate를 deps에 넣으면 타이핑 중 form이 리셋됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(values: FormValues) {
    if (!userId) return
    mutate(
      { user_id: userId, ...values },
      {
        onSuccess: () => {
          toast.success('근무 기록이 저장됐습니다')
          onClose()
        },
        onError: () => toast.error('저장에 실패했습니다'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>근무 기록 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="work_date">날짜</Label>
            <Input id="work_date" type="date" {...register('work_date')} />
            {errors.work_date && (
              <p className="text-xs text-destructive">{errors.work_date.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div className="space-y-1 min-w-0">
              <Label htmlFor="start_time">시작 시간</Label>
              <Input id="start_time" type="time" className="w-full text-sm" {...register('start_time')} />
              {errors.start_time && (
                <p className="text-xs text-destructive">{errors.start_time.message}</p>
              )}
            </div>
            <div className="space-y-1 min-w-0">
              <Label htmlFor="end_time">종료 시간</Label>
              <Input id="end_time" type="time" className="w-full text-sm" {...register('end_time')} />
              {errors.end_time && (
                <p className="text-xs text-destructive">{errors.end_time.message}</p>
              )}
            </div>
          </div>
          {preview && (
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {formatHours(preview.hours)} →{' '}
                <span className="font-semibold text-foreground">
                  {formatCurrency(preview.earnings)}
                </span>
              </p>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Input id="memo" placeholder="예: 오픈 근무" {...register('memo')} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
