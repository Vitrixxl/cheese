import type { Message } from "@shared";
import { api } from "@/lib/api";
import { queryClient } from "@/providers/query-provider";
import {
  useMutation,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";

export const useChatMessages = (chatId: number, limit: number = 50) => {
  return useInfiniteQuery<{ messages: Message[]; nextCursor: number | null }>({
    queryKey: ["chat-message", chatId],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.social
        .chats({ id: chatId })
        .messages.get({
          query: { limit, cursor: pageParam as number },
        });
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

type ChatMessagesPage = { messages: Message[]; nextCursor: number | null };
type ChatMessagesData = InfiniteData<ChatMessagesPage>;

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
      const { data, error } = await api.social
        .chats({ id: chatId })
        .messages.post({
          content,
          gameId,
        });
      if (error) throw error;
      return data;
    },
    onMutate: async ({ chatId, content, gameId }) => {
      await queryClient.cancelQueries({
        queryKey: ["chat-message", chatId],
      });

      const previousData = queryClient.getQueryData<ChatMessagesData>([
        "chat-message",
        chatId,
      ]);

      const optimisticMessage: Message = {
        id: Date.now() * -1,
        chatId,
        content: content?.trim() ?? null,
        gameId: gameId ?? null,
      };

      queryClient.setQueryData<ChatMessagesData>(
        ["chat-message", chatId],
        (old) => {
          if (!old) {
            return {
              pages: [{ messages: [optimisticMessage], nextCursor: null }],
              pageParams: [0],
            };
          }

          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    messages: [optimisticMessage, ...page.messages],
                  }
                : page,
            ),
          };
        },
      );

      return { previousData, chatId };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(
        ["chat-message", context.chatId],
        context.previousData,
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-message", variables.chatId],
      });
    },
  });
};
