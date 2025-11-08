import {
  chat,
  friendRequests,
  usersToChats,
  usersToUsers,
} from "@backend/lib/db/schema";
import { db } from "../lib/db";
import { User } from "@shared";
import { and, eq, or } from "drizzle-orm";

export type FriendWithChat = User & { chatId: number | null };

export const getUsersById = async (ids: User["id"][]) => {
  return db.query.user.findMany({
    where: (user, w) => w.inArray(user.id, ids),
  });
};

export const isFriend = async (userId: User["id"], friendId: User["id"]) => {
  const result = await db.query.usersToUsers.findFirst({
    columns: {},
    where: (utu, w) =>
      w.or(
        w.and(w.eq(utu.userId1, userId), w.eq(utu.userId2, friendId)),
        w.and(w.eq(utu.userId1, friendId), w.eq(utu.userId2, userId)),
      ),
    with: {
      user1: true,
      user2: true,
    },
  });
  return Boolean(result);
};

export const searchUsers = async (
  userId: User["id"],
  query: string,
  limit: number = 10,
) => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) return [];

  const normalizedLimit = Math.min(Math.max(limit, 1), 50);

  const users = await db.query.user.findMany({
    where: (user, w) =>
      // w.and(
      w.or(
        w.like(user.name, `%${trimmedQuery}%`),
        w.like(user.email, `%${trimmedQuery}%`),
      ),
    // w.ne(user.id, userId),
    // ),
    limit: normalizedLimit,
  });
  return users;
};

export const getFriends = async (userId: string): Promise<User[]> => {
  const result = await db.query.usersToUsers.findMany({
    columns: {},
    with: {
      user1: true,
      user2: true,
    },
    where: (utu, w) =>
      w.or(w.eq(utu.userId1, userId), w.eq(utu.userId2, userId)),
  });
  return result.map((r) => (r.user1.id == userId ? r.user2 : r.user1));
};

export const getFriend = async (
  userId: string,
  friendId: string,
): Promise<User | null> => {
  const result = await db.query.usersToUsers.findFirst({
    columns: {},
    where: (utu, w) =>
      w.or(
        w.and(w.eq(utu.userId1, userId), w.eq(utu.userId2, friendId)),
        w.and(w.eq(utu.userId1, friendId), w.eq(utu.userId2, userId)),
      ),
    with: {
      user1: true,
      user2: true,
    },
  });

  if (!result) return null;
  return result.user1.id == userId ? result.user2 : result.user1;
};

export const insertFriendRequest = async (
  userId: User["id"],
  friendId: User["id"],
) => {
  const canWrite = await isFriend(userId, friendId);
  if (!canWrite) return null;
  const friendResult = await getUsersById([friendId]);
  if (friendResult.length == 0) return false;
  await db.insert(friendRequests).values({
    from: userId,
    to: friendId,
  });
  return true;
};

export const handleFriendRequestResponse = async (
  userId: User["id"],
  friendId: User["id"],
  response: boolean,
) => {
  const canWrite = await db.query.friendRequests.findFirst({
    where: (fr, w) => w.and(w.eq(fr.from, friendId), w.eq(fr.to, userId)),
  });
  if (!canWrite) return null;
  if (!response) {
    await db
      .delete(friendRequests)
      .where(
        and(eq(friendRequests.to, userId), eq(friendRequests.from, friendId)),
      );
    return true;
  }
  await db.insert(usersToUsers).values({
    userId1: friendId,
    userId2: userId,
  });
  const [{ chatId }] = await db
    .insert(chat)
    .values({})
    .returning({ chatId: chat.id });

  await db.insert(usersToChats).values([
    { chatId, userId },
    { chatId, userId: friendId },
  ]);
  return true;
};

export const deleteFriendship = async (
  userId: User["id"],
  friendId: User["id"],
) => {
  const canWrite = await isFriend(userId, friendId);
  if (!canWrite) return null;
  await db
    .delete(usersToUsers)
    .where(
      or(
        and(
          eq(usersToUsers.userId1, userId),
          eq(usersToUsers.userId2, friendId),
        ),
        and(
          eq(usersToUsers.userId1, friendId),
          eq(usersToUsers.userId2, userId),
        ),
      ),
    );
  return true;
};

export const getFriendRequests = async (userId: User["id"]) => {
  return db.query.friendRequests.findMany({
    with: {
      from: true,
    },
    where: (friendRequests, w) => w.eq(friendRequests.to, userId),
  });
};
