import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import NavBar from './NavBar'

export default function AppShell() {
  const { user, authReady } = useAuthStore()

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
