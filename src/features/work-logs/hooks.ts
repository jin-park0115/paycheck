import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWorkLogs, insertWorkLog, updateWorkLog, deleteWorkLog } from './api'
import { useAuthStore } from '@/features/auth/store'
import type { WorkLogInsert } from './types'

export function useWorkLogs(year: number, month: number) {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ['work_logs', userId, year, month],
    queryFn: () => fetchWorkLogs(userId!, year, month),
    enabled: !!userId,
  })
}

export function useAddWorkLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: insertWorkLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work_logs'] }),
  })
}

export function useUpdateWorkLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<Omit<WorkLogInsert, 'user_id'>>
    }) => updateWorkLog(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work_logs'] }),
  })
}

export function useDeleteWorkLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work_logs'] }),
  })
}
