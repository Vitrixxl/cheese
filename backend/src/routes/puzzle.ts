import { db } from "@backend/lib/db";
import { puzzle, user as userTable } from "@backend/lib/db/schema";
import { authMacro } from "@backend/macros/auth";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import z from "zod";

export const puzzleRoutes = new Elysia({ prefix: "/puzzle" })
  /**
   * Retrieve the current challenge for the user
   */
  .use(authMacro)
  .get(
    "/",
    async ({ user }) => {
      return db.select().from(puzzle).where(eq(puzzle.id, user.puzzleLevel));
    },
    { auth: true },
  )
  .post(
    "/solve",
    async ({ user, body: { moves }, status }) => {
      const result = await db
        .select()
        .from(puzzle)
        .where(eq(puzzle.id, user.puzzleLevel));
      if (!result || result.length == 0) {
        return status(500, {
          message: "Error while retrieving the puzzle",
        });
      }
      const p = result[0];
      if (p.moves != moves.join(" ")) {
        return status(400, {
          message: "Wrong solution, what are you trying to do buddy",
        });
      }

      await db.update(userTable).set({
        puzzleLevel: user.puzzleLevel + 1,
      });

      return db
        .select()
        .from(puzzle)
        .where(eq(puzzle.id, user.puzzleLevel + 1));
    },
    {
      auth: true,
      body: z.object({
        moves: z.array(z.string()),
      }),
    },
  );
