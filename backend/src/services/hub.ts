import type { GameType } from "@shared";
import type { User } from "../lib/auth";
import { startGame } from "./chess";
import { db } from "@backend/lib/db";
import { eq } from "drizzle-orm";
import { user } from "@backend/lib/db/schema";
export const queueMap = new Map<GameType, Map<User["id"], User>>();

const MAX_ELO_DIFF = 50;
export const matchPlayers = () => {
  queueMap.forEach((q, g) => {
    let i = 0;
    let j = 0;
    for (const [_, p] of q.entries()) {
      let bestMatch: { user: User; diff: number } | null = null;
      for (const [_, p2] of q.entries()) {
        if (j == i) continue;
        const diff = Math.abs(p.elo - p2.elo);
        if (diff > MAX_ELO_DIFF) continue;
        if (!bestMatch || bestMatch.diff > diff) {
          bestMatch = {
            user: p2,
            diff,
          };
          j++;
        }
        j++;
      }
      if (bestMatch) {
        startGame([p, bestMatch.user], g, true);
        q.delete(p.id);
        q.delete(bestMatch.user.id);
      }
      j = 0;
      i++;
    }
  });
};

export const joinQueue = async ({
  userId,
  gameType,
}: {
  userId: User["id"];
  gameType: GameType;
}) => {
  const results = await db.select().from(user).where(eq(user.id, userId));
  if (!results || results.length == 0) {
    // Signal the error next time
    return;
  }
  let queue = queueMap.get(gameType);
  if (!queue) {
    queue = new Map<User["id"], User>();
    queueMap.set(gameType, queue);
  }
  queue.set(userId, results[0]);
};

export const leaveQueue = () => {};
