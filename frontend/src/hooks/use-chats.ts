import { api } from "@/lib/api";
import type { InfiniteData } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import {
  type ChatData,
  type Chat,
  type ChatWithUsersAndMessages,
  type Message,
} from "@shared";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export const useChats = () => {
  return useInfiniteQuery({
    queryKey: ["chats"],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.chats.get({
        query: { cursor: pageParam, limit: 50 },
      });
      if (error) {
        throw new Error(error.value.message);
      }

      for (const chat of data.chats) {
        const isFetching = queryClient.isFetching({
          queryKey: ["message", chat.id],
        });
        if (isFetching) continue;
        let prevData!:
          | InfiniteData<{ messages: Message[]; nextCursor: number }>
          | undefined;

        prevData = queryClient.getQueryData<
          InfiniteData<{ messages: Message[]; nextCursor: number }>
        >(["messages", chat.id]);

        if (!prevData) {
          prevData = {
            pages: [{ messages: chat.messages, nextCursor: 0 }],
            pageParams: [],
          };
        }
        queryClient.setQueryData<
          InfiniteData<{ messages: Message[]; nextCursor: number }>
        >(["messages", chat.id], prevData);

        queryClient.setQueryData<Omit<ChatWithUsersAndMessages, "messages">>(
          ["chat-data", chat.id],
          { id: chat.id, name: chat.name, users: chat.users },
        );
      }

      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
    initialPageParam: 0,
  });
};

export const useChatMessages = (chatId: Chat["id"]) => {
  return useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.chats.messages({ chatId }).get({
        query: {
          cursor: pageParam,
          limit: 50,
        },
      });
      if (error) throw new Error(error.value.message);
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
    initialPageParam: 0,
  });
};

export const useSendChatMessage = (chatId: Chat["id"]) => {
  return useMutation({
    mutationFn: async ({
      content,
      gameId,
    }: {
      content?: string;
      gameId?: string;
    }) => {
      await api.chats.messages({ chatId }).post({
        content,
        gameId,
      });
    },
  });
};

export const useChatData = (chatId: Chat["id"]) => {
  return useQuery<ChatData>({
    queryKey: ["chat-data", chatId],
    queryFn: async () => {
      const { data, error } = await api.chats({ chatId }).data.get();
      if (error) throw new Error(error.value.message);
      return data;
    },
  });
};
