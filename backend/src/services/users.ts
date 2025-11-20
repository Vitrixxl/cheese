import { db } from "@backend/lib/db";
import { type User } from "@shared";

export const searchUsers = async (
  userId: User["id"],
  query: string,
  limit: number = 10,
) => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) return [];

  const normalizedLimit = Math.min(Math.max(limit, 1), 50);

  const results = await db.query.user.findMany({
    where: (user, w) =>
      w.and(
        w.or(
          w.like(user.name, `%${trimmedQuery}%`),
          w.like(user.email, `%${trimmedQuery}%`),
        ),
        w.ne(user.id, userId),
      ),
    with: {
      friendLinks1: {
        where: (friendLink, w) => w.eq(friendLink.userId2, userId),
      },
      friendLinks2: {
        where: (friendLink, w) => w.eq(friendLink.userId1, userId),
      },
    },
    limit: normalizedLimit,
  });

  return results
    .filter((u) => u.friendLinks2.length > 0 || u.friendLinks1.length > 0)
    .map((u) => {
      const { friendLinks1: _, friendLinks2: __, ...rest } = u;
      return {
        ...rest,
        isFriend: u.friendLinks1.length > 0 || u.friendLinks2.length > 0,
      };
    });
};

export const getUserElos = async (userId: User["id"]) => {
  const elos = await db.query.elo.findMany({
    where: (elo, w) => w.eq(elo.userId, userId),
  });
  return elos;
};
