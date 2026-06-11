import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </div>
  )
}
