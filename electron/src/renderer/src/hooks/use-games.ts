import { api } from '@/lib/api'
import type { Game } from '@shared'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

export const useUsersGames = () => {
  return useInfiniteQuery({
    queryKey: ['games'],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.game.user.get({ query: { cursor: pageParam, limit: 50 } })
      if (error) throw new Error(error.value.message)
      return data
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor
    },
    initialPageParam: 0
  })
}

export const useGame = (gameId: Game['id']) => {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const { data, error } = await api.game({ gameId }).get()
      if (error) {
        console.error(error)
        throw new Error(error.value.message)
      }
      return data
    }
  })
}
