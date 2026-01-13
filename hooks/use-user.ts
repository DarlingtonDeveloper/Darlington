import { useAuth } from '@/contexts/auth-context'

export function useUser() {
  const { user, isLoading } = useAuth()
  return {
    userId: user?.id ?? null,
    user,
    isLoading,
  }
}
