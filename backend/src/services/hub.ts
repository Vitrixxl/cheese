import type { GameType } from "@shared";
import type { User } from "../lib/auth";
import { startGame } from "./chess";
import { db } from "@backend/lib/db";
import { eq } from "drizzle-orm";
import { user } from "@backend/lib/db/schema";
import { socketinator } from "@backend/lib/socket";
export const queueMap = new Map<GameType, Map<User["id"], User>>();
export const challengeMap = new Map<
  GameType,
  { sender: User; reciever: User }
>();

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
    // If this happend i'll kill myself
    socketinator.send({
      group: "hub",
      key: "error",
      userId: userId,
      payload: {
        message: "User not found",
      },
    });
    return;
  }
  let queue = queueMap.get(gameType);
  if (!queue) {
    queue = new Map<User["id"], User>();
    queueMap.set(gameType, queue);
  }
  queue.set(userId, results[0]);
};

export const leaveQueue = ({ userId }: { userId: User["id"] }) => {
  queueMap.forEach((q) => q.delete(userId));
};

socketinator.on("hub", "join-queue", joinQueue);
socketinator.on("hub", "quit-queue", leaveQueue);
