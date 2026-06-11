import { parse, differenceInMinutes } from 'date-fns'

const BASE = new Date(2000, 0, 1)

export function calculateHours(startTime: string, endTime: string): number {
  const start = parse(startTime, 'HH:mm', BASE)
  const end = parse(endTime, 'HH:mm', BASE)
  return differenceInMinutes(end, start) / 60
}

export function calculateDailyEarnings(hours: number, hourlyWage: number): number {
  return Math.round(hours * hourlyWage)
}
