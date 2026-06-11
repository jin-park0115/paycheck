import { supabase } from '@/lib/supabase/client'
import type { Profile } from './types'

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, hourly_wage, pay_day, weekly_holiday_pay, tax_type')
    .eq('id', userId)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function upsertProfile(userId: string, updates: Partial<Omit<Profile, 'id'>>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Profile
}
