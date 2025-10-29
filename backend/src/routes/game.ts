import { getGame, getUserGames } from "@backend/services/game";
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
        gameId: z.number(),
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
  );
