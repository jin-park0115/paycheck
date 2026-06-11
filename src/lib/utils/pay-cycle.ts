import { addMonths, setDate } from 'date-fns'
import { ko } from 'date-fns/locale'
import { format } from 'date-fns'

export function getPaymentDate(workMonth: Date, payDay: number = 20): Date {
  return setDate(addMonths(workMonth, 1), payDay)
}

export function formatPaymentDate(workMonth: Date, payDay: number): string {
  return format(getPaymentDate(workMonth, payDay), 'yyyy년 M월 d일', { locale: ko })
}
