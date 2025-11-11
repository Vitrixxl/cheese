import { api } from "@/lib/api";
import { queryClient } from "@/providers/query-provider";
import type { FriendRequests, User } from "@shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";

export const useFriendRequests = () => {
  return useQuery({
    queryKey: ["friend-requests"],
    queryFn: async () => {
      const { data, error } = await api.friend["friend-requests"].get();
      if (error) throw error;
      return data;
    },
  });
};

export const useSendFriendRequest = () => {
  const [isSending, setIsSending] = React.useState(false);
  return {
    isSending,
    sendFriendRequest: async (userId: User["id"]) => {
      setIsSending(true);
      const result = await api.friend["friend-request"].new({ userId }).post();
      setIsSending(false);
      return result;
    },
  };
};

export const useFriends = () => {
  return useQuery<FriendWithChat[]>({
    queryKey: ["friends"],
    queryFn: async () => {
      const { data, error } = await api.friend.get();
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
      userId,
      response,
    }: {
      response: boolean;
      userId: User["id"];
    }) => {
      api.friend["friend-request"]
        .response({ userId })
        .post({}, { query: { response } });
    },
    onMutate: ({ userId }, _) => {
      const prevRequest = queryClient.getQueryData<FriendRequests[]>([
        "friend-requests",
      ]);
      queryClient.setQueryData<FriendRequests[]>(
        ["friend-requests"],
        prevRequest ? [...prevRequest.filter((r) => r.from != userId)] : [],
      );
    },
  });
};

export const useSearchFriend = (query: string) => {
  return useQuery({
    queryKey: ["search-friend", query],
    queryFn: async () => {
      const { data, error } = await api.friend.users.search.get({
        query: { q: query },
      });
      console.error(error);
      if (error) throw new Error("Error while retrieving data");
      return data;
    },
  });
};
