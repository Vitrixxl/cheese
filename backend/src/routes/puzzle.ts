import { db } from "@backend/lib/db";
import { user as userTable } from "@backend/lib/db/schema";
import { authMacro } from "@backend/macros/auth";
import { Chess } from "chess.js";
import Elysia from "elysia";
import z from "zod";

export const puzzleRoutes = new Elysia({ prefix: "/puzzle" })
  /**
   * Retrieve the current challenge for the user
   */
  .use(authMacro)
  .get(
    "/",
    async ({ user, status }) => {
      console.log({ lvl: user.puzzleLevel });
      const result = await db.query.puzzle.findFirst({
        where: (puzzle, w) => w.eq(puzzle.id, user.puzzleLevel + 1),
      });
      if (!result) {
        return status(404, {
          message: "No puzzle found",
        });
      }
      const chess = new Chess();
      chess.load(result.fen);

      return { ...result, color: chess.turn() };
    },
    { auth: true },
  )
  .post(
    "/solve",
    async ({ user, status }) => {
      await db.update(userTable).set({
        puzzleLevel: user.puzzleLevel + 1,
      });

      const result = await db.query.puzzle.findFirst({
        where: (puzzle, w) => w.eq(puzzle.id, user.puzzleLevel + 2),
      });
      if (!result) {
        return status(404, {
          message: "puzzle not found",
        });
      }
      const chess = new Chess();
      chess.load(result.fen);

      return { ...result, color: chess.turn() };
    },
    {
      auth: true,
    },
  );
