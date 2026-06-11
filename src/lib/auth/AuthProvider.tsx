import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/features/auth/store'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthReady } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setAuthReady])

  return <>{children}</>
}
