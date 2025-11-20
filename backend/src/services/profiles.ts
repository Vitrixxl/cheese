import { db } from "@backend/lib/db";
import { type Elo } from "@backend/lib/db/schema";
import { type GameWithUsers, type User } from "@shared";

export type Profile = User & {
  /**
   * The list of the elo in every mode
   */
  elos: Omit<Elo, "userId">[];
  /**
   * The 5 last games of the user
   */
  games: GameWithUsers[];
};

export const getProfileByUserId = async (
  userId: string,
): Promise<Profile | null> => {
  const results = await db.query.user.findFirst({
    with: {
      elos: {
        columns: { elo: true, category: true },
      },
      whiteGames: {
        with: {
          black: {
            with: {
              elos: true,
            },
          },
          white: {
            with: {
              elos: true,
            },
          },
        },
        limit: 5,
      },
      blackGames: {
        with: {
          black: {
            with: {
              elos: true,
            },
          },
          white: {
            with: {
              elos: true,
            },
          },
        },
        limit: 5,
      },
    },
    where: (user, w) => w.eq(user.id, userId),
  });

  if (!results) return null;

  return {
    ...results,
    games: [...results.whiteGames, ...results.blackGames]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, 6),
  };
};
