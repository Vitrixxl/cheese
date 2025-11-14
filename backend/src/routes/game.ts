import { db } from "@backend/lib/db";
import { game } from "@backend/lib/db/schema";
import { authMacro } from "@backend/macros/auth";
import { getGame, getUserGames } from "@backend/services/game";
import {
  GAME_TIME_CONTROLS,
  OUTCOMES,
  TIME_CONTROL_TO_CATEGORY,
} from "@shared";
import Elysia from "elysia";
import z from "zod";

export const gameRoutes = new Elysia({ prefix: "game" })
  .use(authMacro)
  .get(
    "/user",
    async ({ user, query: { cursor, limit } }) => {
      const results = await getUserGames({ userId: user.id, cursor, limit });
      return {
        games: results.length > limit ? results.slice(1, limit) : results,
        nextCursor: results.length > limit ? cursor + limit : null,
      };
    },
    {
      auth: true,
      query: z.object({
        limit: z.coerce.number().default(50),
        cursor: z.coerce.number().default(0),
      }),
    },
  )
  .get(
    "/:gameId",
    async ({ params: { gameId }, status }) => {
      const result = await getGame({ gameId });
      if (!result) {
        return status(404, {
          message: "Unkown game",
        });
      }
      return result;
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
      const results = await getUserGames({ userId, cursor, limit });
      return {
        games: results.length > limit ? results.slice(1, limit) : results,
        nextCursor: results.length > limit ? cursor + limit : null,
      };
    },
    {
      params: z.object({
        userId: z.string(),
      }),
      query: z.object({
        limit: z.coerce.number().default(50),
        cursor: z.coerce.number().default(0),
      }),
    },
  )
  .post(
    "/save",
    async ({
      body: {
        gameId,
        users,
        outcome,
        timers,
        messages,
        winner,
        timeControl,
        pgn,
      },
    }) => {
      const category = TIME_CONTROL_TO_CATEGORY[timeControl];
      await db.insert(game).values({
        id: gameId,
        pgn,
        outcome: outcome,
        timeControl,
        category,
        winner,
        messages,
        whiteId: users.find((u) => u.color == "w")!.userId,
        blackId: users.find((u) => u.color == "b")!.userId,
        blackTimer: Math.max(0, timers.b),
        whiteTimer: Math.max(0, timers.w),
      });
    },
    {
      body: z.object({
        gameId: z.string(),
        pgn: z.string(),
        users: z.array(
          z.object({ userId: z.string(), color: z.literal(["w", "b"]) }),
        ),
        timeControl: z.literal(
          Object.entries(GAME_TIME_CONTROLS)
            .map(([_, k]) => k)
            .flat(),
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
