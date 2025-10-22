import { type Group, type Message } from "@chessinator/types";
import { db } from "../lib/db";
import { and, desc, eq, getTableColumns, inArray, lt, or } from "drizzle-orm";
import {
  chat,
  friend,
  group,
  groupUser,
  message,
  user,
} from "../lib/db/schema";

type DbUser = typeof user.$inferSelect;

export type FriendWithChat = DbUser & { chatId: number | null };

export const getFriends = async (userId: string): Promise<FriendWithChat[]> => {
  const rows = await db
    .select({
      user1: friend.user1,
      user2: friend.user2,
      chatId: friend.chatId,
    })
    .from(friend)
    .where(or(eq(friend.user1, userId), eq(friend.user2, userId)));

  if (rows.length === 0) return [];

  const friendMap = new Map<string, number | null>();
  for (const row of rows) {
    const relatedId = row.user1 === userId ? row.user2 : row.user1;
    if (relatedId) {
      friendMap.set(relatedId, row.chatId ?? null);
    }
  }

  if (friendMap.size === 0) return [];

  const friends = await db
    .select(getTableColumns(user))
    .from(user)
    .where(inArray(user.id, Array.from(friendMap.keys())));

  return friends.map((friendUser) => ({
    ...friendUser,
    chatId: friendMap.get(friendUser.id) ?? null,
  }));
};

export const getFriend = async (
  userId: string,
  friendId: string,
): Promise<FriendWithChat> => {
  const [relation] = await db
    .select({
      user1: friend.user1,
      user2: friend.user2,
      chatId: friend.chatId,
    })
    .from(friend)
    .where(
      or(
        and(eq(friend.user1, userId), eq(friend.user2, friendId)),
        and(eq(friend.user1, friendId), eq(friend.user2, userId)),
      ),
    )
    .limit(1);

  if (!relation) throw new Error("Friend not found");

  const [friendUser] = await db
    .select(getTableColumns(user))
    .from(user)
    .where(eq(user.id, friendId))
    .limit(1);

  if (!friendUser) throw new Error("Friend not found");

  return {
    ...friendUser,
    chatId: relation.chatId ?? null,
  };
};

export const createFriend = async (
  userId: string,
  friendId: string,
): Promise<FriendWithChat> => {
  if (userId === friendId) throw new Error("Cannot add yourself");

  const [targetUser] = await db
    .select(getTableColumns(user))
    .from(user)
    .where(eq(user.id, friendId))
    .limit(1);

  if (!targetUser) throw new Error("User not found");

  const [existing] = await db
    .select({ user1: friend.user1 })
    .from(friend)
    .where(
      or(
        and(eq(friend.user1, userId), eq(friend.user2, friendId)),
        and(eq(friend.user1, friendId), eq(friend.user2, userId)),
      ),
    )
    .limit(1);

  if (existing) throw new Error("Already friends");

  const [chatRow] = await db.insert(chat).values({}).returning({ id: chat.id });

  const [primaryUser, secondaryUser] =
    userId < friendId ? [userId, friendId] : [friendId, userId];

  await db.insert(friend).values({
    user1: primaryUser,
    user2: secondaryUser,
    chatId: chatRow.id,
  });

  return {
    ...targetUser,
    chatId: chatRow.id,
  };
};

export const deleteFriend = async (
  userId: string,
  friendId: string,
): Promise<void> => {
  const [relation] = await db
    .select({
      user1: friend.user1,
      user2: friend.user2,
    })
    .from(friend)
    .where(
      or(
        and(eq(friend.user1, userId), eq(friend.user2, friendId)),
        and(eq(friend.user1, friendId), eq(friend.user2, userId)),
      ),
    )
    .limit(1);

  if (!relation) throw new Error("Friend not found");

  await db
    .delete(friend)
    .where(
      and(eq(friend.user1, relation.user1), eq(friend.user2, relation.user2)),
    );
};

export const getGroup = async (groupId: number): Promise<Group> => {
  const rows = await db
    .select({
      g: group,
      u: user,
    })
    .from(group)
    .innerJoin(groupUser, eq(groupUser.groupId, group.id))
    .innerJoin(user, eq(user.id, groupUser.userId))
    .where(eq(group.id, groupId));

  if (rows.length === 0) throw new Error("Group not found");

  const g = rows[0].g;
  const users = rows.map((r) => r.u);
  return { ...g, users };
};

export const getGroups = async (userId: string): Promise<Group[]> => {
  const groupIds = await db
    .select({ groupId: groupUser.groupId })
    .from(groupUser)
    .where(eq(groupUser.userId, userId));

  const data = await Promise.all(
    groupIds.map(({ groupId }) => {
      return getGroup(groupId);
    }),
  );
  return data;
};

export const createGroup = async (
  userId: string,
  name: string,
  memberIds: string[] = [],
): Promise<Group> => {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) throw new Error("Group name is required");

  const filteredMembers = memberIds.filter(
    (memberId) => memberId && memberId !== userId,
  );
  const uniqueMemberIds = Array.from(new Set([userId, ...filteredMembers]));

  const existingUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(inArray(user.id, uniqueMemberIds));

  if (existingUsers.length !== uniqueMemberIds.length) {
    throw new Error("Group member not found");
  }

  const [chatRow] = await db.insert(chat).values({}).returning({ id: chat.id });

  const [createdGroup] = await db
    .insert(group)
    .values({
      name: trimmedName,
      chatId: chatRow.id,
    })
    .returning({ id: group.id });

  if (!createdGroup) throw new Error("Failed to create group");

  if (uniqueMemberIds.length > 0) {
    await db.insert(groupUser).values(
      uniqueMemberIds.map((memberId) => ({
        groupId: createdGroup.id,
        userId: memberId,
      })),
    );
  }

  return getGroup(createdGroup.id);
};

export const deleteGroup = async (
  userId: string,
  groupId: number,
): Promise<{ deleted: boolean }> => {
  const [groupRow] = await db
    .select({
      id: group.id,
      chatId: group.chatId,
    })
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupRow) throw new Error("Group not found");

  const membership = await db
    .select({ userId: groupUser.userId })
    .from(groupUser)
    .where(and(eq(groupUser.groupId, groupId), eq(groupUser.userId, userId)))
    .limit(1);

  if (membership.length === 0) throw new Error("Not a group member");

  await db
    .delete(groupUser)
    .where(and(eq(groupUser.groupId, groupId), eq(groupUser.userId, userId)));

  const remainingMembers = await db
    .select({ userId: groupUser.userId })
    .from(groupUser)
    .where(eq(groupUser.groupId, groupId))
    .limit(1);

  if (remainingMembers.length > 0) {
    return { deleted: false };
  }

  await db.delete(message).where(eq(message.chatId, groupRow.chatId));
  await db.delete(group).where(eq(group.id, groupId));
  await db.delete(chat).where(eq(chat.id, groupRow.chatId));

  return { deleted: true };
};

export const canReadChat = async (
  userId: string,
  chatId: number,
): Promise<boolean> => {
  const directChat = await db
    .select({ chatId: friend.chatId })
    .from(friend)
    .where(
      and(
        eq(friend.chatId, chatId),
        or(eq(friend.user1, userId), eq(friend.user2, userId)),
      ),
    )
    .limit(1);

  if (directChat.length > 0) return true;

  const groupChat = await db
    .select({ chatId: group.chatId })
    .from(group)
    .innerJoin(groupUser, eq(group.id, groupUser.groupId))
    .where(and(eq(group.chatId, chatId), eq(groupUser.userId, userId)))
    .limit(1);

  return groupChat.length > 0;
};

export const getChatMessagesPaginated = async (
  userId: string,
  chatId: number,
  limit: number,
  cursor?: number,
): Promise<{
  messages: Message[];
  hasNext: boolean;
  nextCursor: number | null;
}> => {
  const canRead = await canReadChat(userId, chatId);
  if (!canRead) throw new Error("Forbidden");

  const normalizedLimit = Math.min(Math.max(limit, 1), 100);

  const rows = await db
    .select(getTableColumns(message))
    .from(message)
    .where(
      cursor !== undefined
        ? and(eq(message.chatId, chatId), lt(message.id, cursor))
        : eq(message.chatId, chatId),
    )
    .orderBy(desc(message.id))
    .limit(normalizedLimit + 1);

  const hasNext = rows.length > normalizedLimit;
  const limitedRows = hasNext ? rows.slice(0, normalizedLimit) : rows;

  const messages = limitedRows
    .map((row) => ({
      id: row.id,
      chatId: (row.chatId ?? chatId) as number,
      content: row.content ?? undefined,
      gameId: row.gameId ?? undefined,
    }))
    .reverse();

  const nextCursor = hasNext && messages.length > 0 ? messages[0].id : null;

  return {
    messages,
    hasNext,
    nextCursor,
  };
};

export const getChatMessages = async (
  userId: string,
  chatId: number,
): Promise<Message[]> => {
  const { messages } = await getChatMessagesPaginated(userId, chatId, 100);
  return messages;
};
