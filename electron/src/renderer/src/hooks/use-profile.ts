import { api } from '@/lib/api'
import type { User } from '@shared'
import { useQuery } from '@tanstack/react-query'

export const useProfile = (userId: User['id']) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await api.profiles({ userId }).get()
      if (error) throw new Error(error.value.message)
      return data
    },
  })
}
