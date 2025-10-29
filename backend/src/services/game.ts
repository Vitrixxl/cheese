import { db } from "@backend/lib/db";
import { or, eq, getTableColumns } from "drizzle-orm";
import { game, user } from "@backend/lib/db/schema";
import { Game, User } from "@shared";
import { alias } from "drizzle-orm/sqlite-core";
import { exclude } from "backend/lib/utils";

const white = alias(user, "whiteUser");
const black = alias(user, "blackUser");

export const getGame = async ({ gameId }: { gameId: Game["id"] }) => {
  const results = await db
    .select({
      ...exclude(getTableColumns(game), ["blackId", "whiteId"]),
      whiteUser: white,
      blackUser: black,
    })
    .from(game)
    .innerJoin(black, eq(black.id, game.blackId))
    .innerJoin(white, eq(white.id, game.whiteId))
    .where(eq(game.id, gameId));
  return results;
};

export const getUserGames = async ({
  userId,
  limit,
  cursor,
}: {
  userId: User["id"];
  limit: number;
  cursor: number;
}) => {
  const results = await db
    .select({
      ...exclude(getTableColumns(game), ["blackId", "whiteId"]),
      whiteUser: white,
      blackUser: black,
    })
    .from(game)
    .innerJoin(black, eq(black.id, game.blackId))
    .innerJoin(white, eq(white.id, game.whiteId))
    .where(or(eq(game.blackId, userId), eq(game.whiteId, userId)))
    .orderBy(game.createdAt)
    .limit(limit)
    .offset(cursor + 1);

  if (!results || results.length == 0) {
    return {
      games: [],
      nextCursor: null,
    };
  }

  return {
    games: results,
    nextCursor: results.length > limit ? cursor + limit : null,
  };
};
