import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, upsertProfile } from './api'
import { useAuthStore } from '@/features/auth/store'
import type { Profile } from './types'

export function useProfile() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)
  return useMutation({
    mutationFn: (updates: Partial<Omit<Profile, 'id'>>) =>
      upsertProfile(userId!, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['work_logs'] })
    },
  })
}
