import { api } from '@/lib/api'
import { queryClient } from '@/providers/query-provider'
import { type Chat, type ChatWithUsers, type MessageWithGame } from '@shared'
import { useInfiniteQuery, useMutation, useQuery, type InfiniteData } from '@tanstack/react-query'
import { useUser } from './use-user'

export const useChats = () => {
  const user = useUser()
  return useInfiniteQuery({
    queryKey: ['chats'],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.chats.get({
        query: { cursor: pageParam, limit: 50 },
      })
      if (error) {
        throw new Error(error.value.message)
      }

      const upToDateChats = data.chats.map((c) => {
        const prevData = queryClient.getQueryData<ChatWithUsers>(['chat', c.id])
        console.log({ prevData })
        queryClient.setQueryData<ChatWithUsers>(['chat', c.id], c)
        if (prevData) {
          const localUser = prevData.users.find((u) => u.id == user.id)
          console.log(localUser)
          if (!localUser) return c
          return {
            ...c,
            users: prevData.users.map((u) => {
              if (u.id == localUser.id) {
                return {
                  ...u,
                  lastSeenAt: localUser.lastSeenAt,
                }
              }
              return u
            }),
          }
        }
        return c
      })

      return { ...data, chats: upToDateChats }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor
    },
    initialPageParam: 0,
  })
}

export const useChat = (chatId: Chat['id']) => {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const { data, error } = await api.chats({ chatId }).get()
      if (error) throw new Error(error.value.message)
      return data
    },
  })
}

export const useChatMessages = (chatId: Chat['id']) => {
  return useInfiniteQuery({
    queryKey: ['messages', chatId],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.chats.messages({ chatId }).get({
        query: {
          cursor: pageParam,
          limit: 50,
        },
      })
      if (error) throw new Error(error.value.message)
      return data
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor
    },
    initialPageParam: 0,
  })
}

export const useLastSeen = (chatId: number) => {
  const user = useUser()
  return useMutation({
    mutationKey: ['lastSeen', chatId],
    mutationFn: async () => {
      await api.chats.seen({ chatId }).post()
    },
    onMutate: () => {
      console.log('mutating')
      const prevData = queryClient.getQueryData<
        InfiniteData<{ chats: ChatWithUsers[]; nextCursor: number | null }>
      >(['chats'])
      console.log(prevData)
      if (!prevData) return
      const newPages = prevData.pages.map((p) => ({
        ...p,
        chats: p.chats.map((c) => {
          let users = [...c.users]
          if (c.id == chatId) {
            users = c.users.map((u) => {
              if (u.id == user.id) {
                return {
                  ...u,
                  lastSeenAt: Date.now(),
                }
              }
              return u
            })
          }
          return { ...c, users }
        }),
      }))
      queryClient.setQueryData(['chats'], {
        pages: newPages,
        pageParams: prevData.pageParams,
      })
    },
  })
}

export const useSendChatMessage = (chatId: Chat['id']) => {
  return useMutation({
    mutationFn: async ({
      messageId,
      content,
      gameId,
    }: {
      content: string | null
      gameId: string | null
      messageId: string
    }) => {
      await api.chats.messages({ chatId }).post({
        id: messageId,
        content,
        gameId,
      })
    },
  })
}

export const useAppendMessage = () => {
  return async (chatId: Chat['id'], message: MessageWithGame) => {
    const prevData = queryClient.getQueryData<
      InfiniteData<{ messages: MessageWithGame[]; nextCursor: number | null }>
    >(['messages', chatId])
    console.log({ prevData })
    if (!prevData) return

    queryClient.setQueryData(['messages', chatId], {
      ...prevData,
      pages: prevData.pages.map((p, i) => {
        if (i != 0) return p
        return {
          ...p,
          messages: [...p.messages, message],
        }
      }),
    })
  }
}
