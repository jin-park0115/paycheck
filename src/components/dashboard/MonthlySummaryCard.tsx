import { useMemo } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { WorkLog } from '@/features/work-logs/types'
import type { TaxType } from '@/features/settings/types'
import { calculatePayroll } from '@/lib/utils/payroll'
import { formatCurrency, formatHours } from '@/lib/utils/format'
import { formatPaymentDate } from '@/lib/utils/pay-cycle'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  logs: WorkLog[]
  hourlyWage: number
  payDay: number
  weeklyHolidayPay: boolean
  taxType: TaxType
  year: number
  month: number
}

export default function MonthlySummaryCard({
  logs,
  hourlyWage,
  payDay,
  weeklyHolidayPay,
  taxType,
  year,
  month,
}: Props) {
  const { totalHours, payroll } = useMemo(() => {
    const totalHours = logs.reduce((s, l) => s + Number(l.hours_worked), 0)
    const payroll = calculatePayroll(logs, hourlyWage, weeklyHolidayPay, taxType)
    return { totalHours, payroll }
  }, [logs, hourlyWage, weeklyHolidayPay, taxType])

  const workMonth = new Date(year, month - 1, 1)
  const monthLabel = format(workMonth, 'yyyy년 M월', { locale: ko })
  const paymentDateLabel = formatPaymentDate(workMonth, payDay)

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{monthLabel} 요약</p>
          <p className="text-xs text-muted-foreground">급여일 {paymentDateLabel}</p>
        </div>

        {/* 상단 핵심 수치 */}
        <div className="mb-4 rounded-xl bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">실수령액</p>
          <p className="text-2xl font-bold">{formatCurrency(payroll.netPay)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{logs.length}일 · {formatHours(totalHours)}</p>
        </div>

        {/* 내역 */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">기본 급여</span>
            <span>{formatCurrency(payroll.basePay)}</span>
          </div>
          {payroll.weeklyHolidayPay > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>주휴수당</span>
              <span>+ {formatCurrency(payroll.weeklyHolidayPay)}</span>
            </div>
          )}
          {payroll.taxAmount > 0 && (
            <div className="flex justify-between text-destructive">
              <span>{taxType === '3.3' ? '원천징수 (3.3%)' : '4대보험'}</span>
              <span>- {formatCurrency(payroll.taxAmount)}</span>
            </div>
          )}
          {(payroll.weeklyHolidayPay > 0 || payroll.taxAmount > 0) && (
            <div className="flex justify-between border-t pt-1.5 font-medium">
              <span>실수령액</span>
              <span>{formatCurrency(payroll.netPay)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
