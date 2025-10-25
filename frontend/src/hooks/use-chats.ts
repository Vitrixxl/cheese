import type { Message } from "@shared";
import { api } from "@frontend/lib/api";
import { queryClient } from "@frontend/providers/query-provider";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";

export const useChatMessages = (
  chatId: number,
  limit: number = 50,
  cursor?: number,
) => {
  return useQuery<{
    messages: Message[];
    hasNext: boolean;
    nextCursor: number | null;
  }>({
    queryKey: ["chat-messages", chatId, limit, cursor],
    queryFn: async () => {
      const { data, error } = await api.social.chats({ id: chatId }).messages.get(
        {
          query: { limit, cursor },
        },
      );
      if (error) throw error;
      return data;
    },
    enabled: !!chatId,
  });
};

export const useInfiniteChatMessages = (chatId: number, limit: number = 50) => {
  return useInfiniteQuery<{
    messages: Message[];
    hasNext: boolean;
    nextCursor: number | null;
  }>({
    queryKey: ["infinite-chat-messages", chatId],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.social.chats({ id: chatId }).messages.get(
        {
          query: {
            limit,
            cursor: pageParam as number | undefined,
          },
        },
      );
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    enabled: !!chatId,
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationKey: ["send-message"],
    mutationFn: async ({
      chatId,
      content,
      gameId,
    }: {
      chatId: number;
      content?: string;
      gameId?: number;
    }) => {
      // Note: This assumes you have a send message endpoint
      // If not, you'll need to add it to your backend
      const { data, error } = await api.social.chats({ id: chatId }).messages.post(
        {
          content,
          gameId,
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.chatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-chat-messages", variables.chatId],
      });
    },
  });
};
