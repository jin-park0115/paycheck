import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

type AuthState = {
  user: User | null
  authReady: boolean
  setUser: (user: User | null) => void
  setAuthReady: (ready: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authReady: false,
      setUser: (user) => set({ user }),
      setAuthReady: (authReady) => set({ authReady }),
    }),
    {
      name: 'paycheck_auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
