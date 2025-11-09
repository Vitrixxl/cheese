import { api } from "@/lib/api";
import { queryClient } from "@/providers/query-provider";
import type { PuzzleWithColor } from "@shared";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const usePuzzle = () => {
  return useQuery({
    queryKey: ["puzzle"],
    queryFn: async () => {
      const { data, error } = await api.puzzle.get();
      if (error) throw new Error(error.value.message);
      return data;
    },
  });
};

export const useNextPuzzle = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const fetchNext = async () => {
    setIsLoading(true);
    const { data, error } = await api.puzzle.solve.post();
    if (error) {
      setIsLoading(false);
      throw new Error(error.value.message);
    }
    queryClient.setQueryData<PuzzleWithColor>(["puzzle"], data);
    setIsLoading(false);
  };

  return { fetchNext, isLoading };
};
