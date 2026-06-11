import { useState } from 'react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import type { WorkLog } from '@/features/work-logs/types'
import { useDeleteWorkLog } from '@/features/work-logs/hooks'
import { calculateDailyEarnings } from '@/features/work-logs/utils'
import { formatCurrency, formatHours } from '@/lib/utils/format'
import EditWorkLogDialog from './EditWorkLogDialog'

interface Props {
  logs: WorkLog[]
  hourlyWage: number
}

export default function WorkLogList({ logs, hourlyWage }: Props) {
  const { mutate: del } = useDeleteWorkLog()
  const [editing, setEditing] = useState<WorkLog | null>(null)

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">이번 달 근무 기록이 없습니다</p>
      </div>
    )
  }

  const totalHours = logs.reduce((s, l) => s + Number(l.hours_worked), 0)
  const totalEarnings = calculateDailyEarnings(totalHours, hourlyWage)

  return (
    <>
      <div className="divide-y rounded-xl border bg-card overflow-hidden">
        {[...logs].reverse().map((log) => {
          const hours = Number(log.hours_worked)
          const earnings = calculateDailyEarnings(hours, hourlyWage)
          const date = parseISO(log.work_date)
          return (
            <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {format(date, 'M월 d일 (EEE)', { locale: ko })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {log.start_time.slice(0, 5)} ~ {log.end_time.slice(0, 5)} · {formatHours(hours)}
                </span>
                {log.memo && (
                  <span className="text-xs text-muted-foreground">{log.memo}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(earnings)}
                </span>
                <button
                  onClick={() => setEditing(log)}
                  className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="수정"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('이 기록을 삭제하시겠습니까?'))
                      del(log.id, {
                        onSuccess: () => toast.success('삭제됐습니다'),
                        onError: () => toast.error('삭제에 실패했습니다'),
                      })
                  }}
                  className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
        <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
          <span className="text-sm font-medium">합계 {formatHours(totalHours)}</span>
          <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalEarnings)}</span>
        </div>
      </div>

      {editing && (
        <EditWorkLogDialog
          log={editing}
          hourlyWage={hourlyWage}
          open={!!editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
