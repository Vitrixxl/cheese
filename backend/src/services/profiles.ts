import { db } from "@backend/lib/db";
import { Elo } from "@backend/lib/db/schema";
import { GameWithUsers, User } from "@shared";

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
  const result = await db.query.user.findFirst({
    with: {
      elos: {
        columns: { elo: true, category: true },
      },
      games: {
        limit: 5,
        columns: {},
        with: {
          game: {
            columns: {
              id: true,
              blackTimer: true,
              whiteTimer: true,
              outcome: true,
              winner: true,
              moves: true,
              messages: true,
              createdAt: true,
            },
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
          },
        },
      },
    },
    where: (user, w) => w.eq(user.id, userId),
  });

  if (!result) return null;
  return { ...result, games: result.games.map((g) => g.game) };
};
