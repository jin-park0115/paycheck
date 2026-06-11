import { supabase } from '@/lib/supabase/client'
import type { WorkLog, WorkLogInsert } from './types'

export async function fetchWorkLogs(
  userId: string,
  year: number,
  month: number
): Promise<WorkLog[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('work_logs')
    .select('id, work_date, start_time, end_time, hours_worked, memo, created_at')
    .eq('user_id', userId)
    .gte('work_date', from)
    .lte('work_date', to)
    .order('work_date', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as WorkLog[]
}

export async function insertWorkLog(payload: WorkLogInsert): Promise<WorkLog> {
  const { data, error } = await supabase
    .from('work_logs')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as WorkLog
}

export async function updateWorkLog(
  id: string,
  payload: Partial<Omit<WorkLogInsert, 'user_id'>>
): Promise<WorkLog> {
  const { data, error } = await supabase
    .from('work_logs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as WorkLog
}

export async function deleteWorkLog(id: string): Promise<void> {
  const { error } = await supabase.from('work_logs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
