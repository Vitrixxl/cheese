import { db } from "@backend/lib/db";
import { or, eq, getTableColumns } from "drizzle-orm";
import { game, user } from "@backend/lib/db/schema";
import { Game, User } from "@shared";
import { alias } from "drizzle-orm/sqlite-core";
import { exclude } from "backend/lib/utils";

const white = alias(user, "whiteUser");
const black = alias(user, "blackUser");

export const getGame = async ({ gameId }: { gameId: Game["id"] }) => {
  const result = await db.query.game.findFirst({
    with: {
      black: true,
      white: true,
    },
    where: (game, w) => w.eq(game.id, gameId),
  });
  return result;
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
  const results = await db.query.game.findMany({
    with: {
      white: {
        with: {
          elos: true,
        },
      },
      black: {
        with: {
          elos: true,
        },
      },
    },
    where: (game, w) =>
      w.or(w.eq(game.blackId, userId), w.eq(game.whiteId, userId)),
    orderBy: (game) => game.createdAt,
    limit: limit + 1,
    offset: cursor,
  });
  return results;
};
