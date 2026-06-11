import { parseISO, startOfWeek } from 'date-fns'
import { format } from 'date-fns'
import type { WorkLog } from '@/features/work-logs/types'
import type { TaxType } from '@/features/settings/types'

export interface PayrollBreakdown {
  basePay: number
  weeklyHolidayPay: number
  grossPay: number
  taxAmount: number
  netPay: number
}

export function calculatePayroll(
  logs: WorkLog[],
  hourlyWage: number,
  enableWeeklyHolidayPay: boolean,
  taxType: TaxType
): PayrollBreakdown {
  const totalHours = logs.reduce((s, l) => s + Number(l.hours_worked), 0)
  const basePay = Math.round(totalHours * hourlyWage)

  const weeklyHolidayPay = enableWeeklyHolidayPay
    ? calcWeeklyHolidayPay(logs, hourlyWage)
    : 0

  const grossPay = basePay + weeklyHolidayPay
  const taxAmount = calcTax(grossPay, taxType)
  const netPay = grossPay - taxAmount

  return { basePay, weeklyHolidayPay, grossPay, taxAmount, netPay }
}

function calcWeeklyHolidayPay(logs: WorkLog[], hourlyWage: number): number {
  // 월~일 기준으로 주별 근무시간 합산
  const weeklyHours: Record<string, number> = {}
  for (const log of logs) {
    const date = parseISO(log.work_date)
    const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    weeklyHours[weekKey] = (weeklyHours[weekKey] ?? 0) + Number(log.hours_worked)
  }

  let total = 0
  for (const hours of Object.values(weeklyHours)) {
    if (hours >= 15) {
      // 주휴수당 = (주당 근무시간 / 40) × 8 × 시급
      total += (hours / 40) * 8 * hourlyWage
    }
  }
  return Math.round(total)
}

function calcTax(grossPay: number, taxType: TaxType): number {
  if (taxType === 'none') return 0
  if (taxType === '3.3') return Math.round(grossPay * 0.033)
  // 4대보험: 국민연금 4.5% + 건강보험 3.545% + 장기요양보험 0.4591% + 고용보험 0.9%
  return Math.round(grossPay * (0.045 + 0.03545 + 0.004591 + 0.009))
}
