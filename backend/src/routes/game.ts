import { db } from "@backend/lib/db";
import { game } from "@backend/lib/db/schema";
import { getGame, getUserGames } from "@backend/services/game";
import { OUTCOMES } from "@shared";
import Elysia from "elysia";
import z from "zod";

export const gameRoutes = new Elysia({ prefix: "game" })
  .get(
    "/:gameId",
    async ({ params: { gameId }, status }) => {
      const result = await getGame({ gameId });
      if (!result || result.length == 0) {
        return status(404, {
          message: "Unkown game",
        });
      }
      return result[0];
    },
    {
      params: z.object({
        gameId: z.string(),
      }),
    },
  )
  .get(
    "user/:userId",
    async ({ params: { userId }, query: { cursor, limit } }) => {
      return await getUserGames({ userId, cursor, limit });
    },
    {
      params: z.object({
        userId: z.string(),
      }),
      query: z.object({
        limit: z.number().default(50),
        cursor: z.number().default(0),
      }),
    },
  )
  .post(
    "/save",
    async ({ body: { gameId, users, outcome, timers, messages, winner } }) => {
      db.insert(game).values({
        id: gameId,
        outcome: outcome,
        winner,
        messages,
        whiteId: users.find((u) => u.color == "w")!.userId,
        blackId: users.find((u) => u.color == "b")!.userId,
        blackTimer: timers.b,
        whiteTimer: timers.w,
      });
    },
    {
      body: z.object({
        gameId: z.string(),
        users: z.array(
          z.object({ userId: z.string(), color: z.literal(["w", "b"]) }),
        ),
        outcome: z.literal(OUTCOMES),
        timers: z.record(z.literal(["w", "b"]), z.number()),
        winner: z.nullable(z.literal(["w", "b"])),
        messages: z.array(
          z.object({
            userId: z.string(),
            content: z.string(),
          }),
        ),
      }),
    },
  );
