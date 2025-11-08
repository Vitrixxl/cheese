import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

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
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
    initialPageParam: 0,
  });
};
