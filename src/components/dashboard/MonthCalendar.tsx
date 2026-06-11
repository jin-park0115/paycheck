import { useMemo, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameMonth,
  isToday,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { WorkLog } from '@/features/work-logs/types'
import { calculateDailyEarnings } from '@/features/work-logs/utils'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import AddWorkLogDialog from './AddWorkLogDialog'
import EditWorkLogDialog from '@/components/logs/EditWorkLogDialog'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface Props {
  year: number
  month: number
  logs: WorkLog[]
  hourlyWage: number
  onPrev: () => void
  onNext: () => void
}

export default function MonthCalendar({ year, month, logs, hourlyWage, onPrev, onNext }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const [addDate, setAddDate] = useState<string | undefined>()
  const [editLog, setEditLog] = useState<WorkLog | null>(null)

  const monthDate = new Date(year, month - 1, 1)
  const days = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) })
  const startPadding = getDay(startOfMonth(monthDate))

  const logsByDate = useMemo(() => {
    const map: Record<string, WorkLog[]> = {}
    for (const log of logs) {
      if (!map[log.work_date]) map[log.work_date] = []
      map[log.work_date].push(log)
    }
    return map
  }, [logs])

  function handleDayClick(dateStr: string, dayLogs: WorkLog[]) {
    if (dayLogs.length === 1) {
      setEditLog(dayLogs[0])
    } else {
      setAddDate(dateStr)
      setAddOpen(true)
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <button
            onClick={onPrev}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold">
            {format(monthDate, 'yyyy년 M월', { locale: ko })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onNext}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight size={18} />
            </button>
            <Button size="sm" className="ml-1 h-8 gap-1" onClick={() => { setAddDate(undefined); setAddOpen(true) }}>
              <Plus size={14} />
              추가
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={cn(
                'py-2 text-center text-xs font-medium text-muted-foreground',
                i === 0 && 'text-red-400',
                i === 6 && 'text-blue-400'
              )}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="border-b border-r p-1 h-16 sm:h-20" />
          ))}
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayLogs = logsByDate[dateStr] ?? []
            const totalHours = dayLogs.reduce((s, l) => s + Number(l.hours_worked), 0)
            const earnings = dayLogs.length > 0 ? calculateDailyEarnings(totalHours, hourlyWage) : 0
            const col = (startPadding + idx) % 7

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr, dayLogs)}
                className={cn(
                  'relative flex flex-col items-start gap-0.5 border-b border-r p-1 h-16 sm:h-20 text-left hover:bg-muted/40 transition-colors',
                  !isSameMonth(day, monthDate) && 'opacity-30',
                  col === 0 && 'text-red-500',
                  col === 6 && 'text-blue-500'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isToday(day) && 'bg-primary text-primary-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {earnings > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-600 leading-none">
                    {formatCurrency(earnings)}
                  </span>
                )}
                {dayLogs.length > 1 && (
                  <span className="text-[9px] text-muted-foreground">{dayLogs.length}건</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <AddWorkLogDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        initialDate={addDate}
        hourlyWage={hourlyWage}
      />

      {editLog && (
        <EditWorkLogDialog
          log={editLog}
          hourlyWage={hourlyWage}
          open={!!editLog}
          onClose={() => setEditLog(null)}
        />
      )}
    </>
  )
}
