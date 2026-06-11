export interface WorkLog {
  id: string
  work_date: string
  start_time: string
  end_time: string
  hours_worked: number
  memo: string | null
  created_at: string
}

export interface WorkLogInsert {
  user_id: string
  work_date: string
  start_time: string
  end_time: string
  memo?: string
}
