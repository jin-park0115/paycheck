import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignupForm />
    </div>
  )
}
