import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['users', query],
    queryFn: async () => {
      const { data, error } = await api.users.search.get({ query: { q: query } })
      if (error) {
        throw new Error(error.value.message)
      }
      return data
    },
  })
}
