import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useWorkLogs } from '@/features/work-logs/hooks'
import { useProfile } from '@/features/settings/hooks'
import { useCurrentMonth } from '@/hooks/useCurrentMonth'
import WorkLogList from '@/components/logs/WorkLogList'
import AddWorkLogDialog from '@/components/dashboard/AddWorkLogDialog'
import { Button } from '@/components/ui/button'

export default function LogsPage() {
  const { year, month, prevMonth, nextMonth } = useCurrentMonth()
  const { data: logs = [], isLoading } = useWorkLogs(year, month)
  const { data: profile } = useProfile()
  const [dialogOpen, setDialogOpen] = useState(false)

  const hourlyWage = profile?.hourly_wage ?? 10320
  const monthDate = new Date(year, month - 1, 1)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-base font-semibold">
            {format(monthDate, 'yyyy년 M월', { locale: ko })}
          </h1>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
          <Plus size={14} />
          추가
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      ) : (
        <WorkLogList logs={logs} hourlyWage={hourlyWage} />
      )}

      <AddWorkLogDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        hourlyWage={hourlyWage}
      />
    </div>
  )
}
