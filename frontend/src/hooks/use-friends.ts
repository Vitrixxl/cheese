import type { FriendWithChat } from "@backend/services/social";
import { api } from "@/lib/api";
import { queryClient } from "@/providers/query-provider";
import type { FriendRequests } from "@shared";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useFriends = () => {
  return useQuery<FriendWithChat[]>({
    queryKey: ["friends"],
    queryFn: async () => {
      const { data, error } = await api.social.friends.get();
      if (error) throw error;
      return data;
    },
  });
};

export const useAddFriend = () => {
  return useMutation({
    mutationKey: ["add-friend"],
    mutationFn: async ({ userId }: { userId: string }) => {
      api.social["friend-requests"].post({ toUserId: userId });
    },
  });
};

export const useProcessFriendRequest = () => {
  return useMutation({
    mutationKey: ["friend"],
    mutationFn: async ({
      accept,
      requestId,
    }: {
      accept: boolean;
      requestId: number;
    }) => {
      api.social["friend-requests"]({ requestId })({
        action: accept ? "accept" : "deny",
      });
    },
    onMutate: ({ accept, requestId }, _) => {
      if (!accept) {
        const prevRequest = queryClient.getQueryData<FriendRequests[]>([
          "friend-requests",
        ]);
        queryClient.setQueryData<FriendRequests[]>(
          ["friend-requests"],
          prevRequest ? [...prevRequest.filter((r) => r.id != requestId)] : [],
        );
      }
    },
  });
};

export const useSearchFriend = (query: string) => {
  return useQuery({
    queryKey: ["search-friend", query],
    queryFn: async () => {
      const { data, error } = await api.social.users.search.get({
        query: { q: query },
      });
      console.error(error);
      if (error) throw new Error("Error while retrieving data");
      return data;
    },
  });
};
