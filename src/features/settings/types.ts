export type TaxType = 'none' | '3.3' | 'insurance'

export interface Profile {
  id: string
  hourly_wage: number
  pay_day: number
  weekly_holiday_pay: boolean
  tax_type: TaxType
}
