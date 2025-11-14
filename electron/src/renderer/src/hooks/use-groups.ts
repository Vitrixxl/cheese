import type { Group, GroupWithUsers } from '@shared'
import { api } from '@/lib/api'
import { queryClient } from '@/providers/query-provider'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useGroups = () => {
  return useQuery<GroupWithUsers[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await api.social.groups.get()
      if (error) throw error
      return data
    }
  })
}

export const useGroup = (groupId: number) => {
  return useQuery<GroupWithUsers>({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data, error } = await api.social.groups({ id: groupId }).get()
      if (error) throw error
      return data
    },
    enabled: !!groupId
  })
}

export const useCreateGroup = () => {
  return useMutation({
    mutationKey: ['create-group'],
    mutationFn: async ({ name, members }: { name: string; members?: string[] }) => {
      const { data, error } = await api.social.groups.post({ name, members })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })
}

export const useDeleteGroup = () => {
  return useMutation({
    mutationKey: ['delete-group'],
    mutationFn: async ({ groupId }: { groupId: number }) => {
      const { data, error } = await api.social.groups({ id: groupId }).delete()
      if (error) throw error
      return data
    },
    onMutate: ({ groupId }) => {
      const prevGroups = queryClient.getQueryData<Group[]>(['groups'])
      queryClient.setQueryData<Group[]>(
        ['groups'],
        prevGroups ? prevGroups.filter((g) => g.id !== groupId) : []
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })
}

export const useGroupRequests = () => {
  return useQuery({
    queryKey: ['group-requests'],
    queryFn: async () => {
      const { data, error } = await api.social['group-requests'].get()
      if (error) throw error
      return data
    }
  })
}

export const useSendGroupRequest = () => {
  return useMutation({
    mutationKey: ['send-group-request'],
    mutationFn: async ({ toUserId, groupId }: { toUserId: string; groupId: number }) => {
      const { data, error } = await api.social['group-requests'].post({
        toUserId,
        groupId
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-requests'] })
    }
  })
}

export const useProcessGroupRequest = () => {
  return useMutation({
    mutationKey: ['process-group-request'],
    mutationFn: async ({ accept, requestId }: { accept: boolean; requestId: number }) => {
      const { data, error } = await api.social['group-requests']({ requestId })({
        action: accept ? 'accept' : 'deny'
      }).post()
      if (error) throw error
      return data
    },
    onMutate: ({ accept, requestId }) => {
      if (!accept) {
        const prevRequests = queryClient.getQueryData<{
          incoming: any[]
          outgoing: any[]
        }>(['group-requests'])
        if (prevRequests) {
          queryClient.setQueryData(['group-requests'], {
            incoming: prevRequests.incoming.filter((r) => r.id !== requestId),
            outgoing: prevRequests.outgoing
          })
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-requests'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })
}

export const useCancelGroupRequest = () => {
  return useMutation({
    mutationKey: ['cancel-group-request'],
    mutationFn: async ({ requestId }: { requestId: number }) => {
      const { data, error } = await api.social['group-requests']({
        requestId
      }).delete()
      if (error) throw error
      return data
    },
    onMutate: ({ requestId }) => {
      const prevRequests = queryClient.getQueryData<{
        incoming: any[]
        outgoing: any[]
      }>(['group-requests'])
      if (prevRequests) {
        queryClient.setQueryData(['group-requests'], {
          incoming: prevRequests.incoming,
          outgoing: prevRequests.outgoing.filter((r) => r.id !== requestId)
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-requests'] })
    }
  })
}
