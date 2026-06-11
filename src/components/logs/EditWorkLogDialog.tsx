import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateWorkLog } from '@/features/work-logs/hooks'
import { calculateHours, calculateDailyEarnings } from '@/features/work-logs/utils'
import { formatCurrency, formatHours } from '@/lib/utils/format'
import type { WorkLog } from '@/features/work-logs/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const schema = z
  .object({
    work_date: z.string().min(1),
    start_time: z.string().min(1),
    end_time: z.string().min(1),
    memo: z.string().optional(),
  })
  .refine((d) => d.start_time < d.end_time, {
    message: '종료 시간은 시작 시간보다 늦어야 합니다',
    path: ['end_time'],
  })

type FormValues = z.infer<typeof schema>

interface Props {
  log: WorkLog
  hourlyWage: number
  open: boolean
  onClose: () => void
}

export default function EditWorkLogDialog({ log, hourlyWage, open, onClose }: Props) {
  const { mutate, isPending } = useUpdateWorkLog()
  const [preview, setPreview] = useState<{ hours: number; earnings: number } | null>(null)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      work_date: log.work_date,
      start_time: log.start_time.slice(0, 5),
      end_time: log.end_time.slice(0, 5),
      memo: log.memo ?? '',
    },
  })

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  useEffect(() => {
    if (startTime && endTime && startTime < endTime) {
      const hours = calculateHours(startTime, endTime)
      setPreview({ hours, earnings: calculateDailyEarnings(hours, hourlyWage) })
    } else {
      setPreview(null)
    }
  }, [startTime, endTime, hourlyWage])

  useEffect(() => {
    if (!open) return
    reset({
      work_date: log.work_date,
      start_time: log.start_time.slice(0, 5),
      end_time: log.end_time.slice(0, 5),
      memo: log.memo ?? '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(values: FormValues) {
    mutate(
      { id: log.id, payload: values },
      {
        onSuccess: () => { toast.success('수정됐습니다'); onClose() },
        onError: () => toast.error('수정에 실패했습니다'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>근무 기록 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>날짜</Label>
            <Input type="date" {...register('work_date')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>시작 시간</Label>
              <Input type="time" {...register('start_time')} />
            </div>
            <div className="space-y-1">
              <Label>종료 시간</Label>
              <Input type="time" {...register('end_time')} />
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
            <Label>메모</Label>
            <Input {...register('memo')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
