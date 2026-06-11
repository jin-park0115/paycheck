import { useWorkLogs } from '@/features/work-logs/hooks'
import { useProfile } from '@/features/settings/hooks'
import { useCurrentMonth } from '@/hooks/useCurrentMonth'
import MonthCalendar from '@/components/dashboard/MonthCalendar'
import MonthlySummaryCard from '@/components/dashboard/MonthlySummaryCard'

export default function DashboardPage() {
  const { year, month, prevMonth, nextMonth } = useCurrentMonth()
  const { data: logs = [], isLoading: logsLoading } = useWorkLogs(year, month)
  const { data: profile, isLoading: profileLoading } = useProfile()

  const hourlyWage = profile?.hourly_wage ?? 10320
  const payDay = profile?.pay_day ?? 20
  const weeklyHolidayPay = profile?.weekly_holiday_pay ?? false
  const taxType = profile?.tax_type ?? 'none'

  if (profileLoading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />

  return (
    <div className="flex flex-col gap-4">
      <MonthlySummaryCard
        logs={logs}
        hourlyWage={hourlyWage}
        payDay={payDay}
        weeklyHolidayPay={weeklyHolidayPay}
        taxType={taxType}
        year={year}
        month={month}
      />
      {logsLoading ? (
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      ) : (
        <MonthCalendar
          year={year}
          month={month}
          logs={logs}
          hourlyWage={hourlyWage}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
      )}
    </div>
  )
}
