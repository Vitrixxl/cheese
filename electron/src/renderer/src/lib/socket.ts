import { chessApi } from "./api";
import type { User } from "@shared";

export function getGameWs({
  gameId,
  userId,
}: {
  userId: User["id"];
  gameId: string;
}) {
  const ws = chessApi.ws.subscribe({
    query: {
      gameId,
      userId,
    },
  });
  return ws;
}
