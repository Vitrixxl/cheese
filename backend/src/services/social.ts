import { db } from "../lib/db";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  like,
  lt,
  or,
} from "drizzle-orm";
import {
  chat,
  friend,
  friendRequests,
  Group,
  group,
  groupRequest,
  groupUser,
  Message,
  message,
  user,
} from "../lib/db/schema";

type DbUser = typeof user.$inferSelect;

export type FriendWithChat = DbUser & { chatId: number | null };

// User Search
export const searchUsers = async (
  query: string,
  limit: number = 10,
): Promise<DbUser[]> => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) return [];

  const normalizedLimit = Math.min(Math.max(limit, 1), 50);

  const users = await db
    .select(getTableColumns(user))
    .from(user)
    .where(
      or(
        like(user.name, `%${trimmedQuery}%`),
        like(user.email, `%${trimmedQuery}%`),
      ),
    )
    .limit(normalizedLimit);

  return users;
};

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
): Promise<FriendWithChat | null> => {
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

  if (!relation) return null;

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

export const getGroup = async (groupId: number) => {
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
  cursor: number,
): Promise<{
  messages: Message[];
  nextCursor: number | null;
}> => {
  const canRead = await canReadChat(userId, chatId);
  if (!canRead) throw new Error("Forbidden");

  const rows = await db
    .select()
    .from(message)
    .where(
      cursor !== undefined
        ? and(eq(message.chatId, chatId), lt(message.id, cursor))
        : eq(message.chatId, chatId),
    )
    .orderBy(desc(message.id))
    .limit(limit + 1);

  const hasNext = rows.length > limit;
  const limitedRows = hasNext ? rows.slice(0, limit) : rows;

  const nextCursor = hasNext ? limit + cursor : null;

  return {
    messages: limitedRows,
    nextCursor,
  };
};

// Friend Requests
export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string,
): Promise<{ id: number; from: string; to: string }> => {
  if (fromUserId === toUserId)
    throw new Error("Cannot send request to yourself");

  const [targetUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, toUserId))
    .limit(1);

  if (!targetUser) throw new Error("User not found");

  const [existingFriend] = await db
    .select({ user1: friend.user1 })
    .from(friend)
    .where(
      or(
        and(eq(friend.user1, fromUserId), eq(friend.user2, toUserId)),
        and(eq(friend.user1, toUserId), eq(friend.user2, fromUserId)),
      ),
    )
    .limit(1);

  if (existingFriend) throw new Error("Already friends");

  const [existingRequest] = await db
    .select({ id: friendRequests.id })
    .from(friendRequests)
    .where(
      and(eq(friendRequests.from, fromUserId), eq(friendRequests.to, toUserId)),
    )
    .limit(1);

  if (existingRequest) throw new Error("Friend request already sent");

  const [reverseRequest] = await db
    .select({ id: friendRequests.id })
    .from(friendRequests)
    .where(
      and(eq(friendRequests.from, toUserId), eq(friendRequests.to, fromUserId)),
    )
    .limit(1);

  if (reverseRequest) throw new Error("This user already sent you a request");

  const [newRequest] = await db
    .insert(friendRequests)
    .values({
      from: fromUserId,
      to: toUserId,
    })
    .returning({ id: friendRequests.id });

  return { id: newRequest.id, from: fromUserId, to: toUserId };
};

export const getFriendRequests = async (
  userId: string,
): Promise<{
  incoming: Array<{ id: number; from: DbUser; createdAt: Date }>;
  outgoing: Array<{ id: number; to: DbUser; createdAt: Date }>;
}> => {
  const incoming = await db
    .select({
      id: friendRequests.id,
      user: getTableColumns(user),
      createdAt: friendRequests.createdAt,
    })
    .from(friendRequests)
    .innerJoin(user, eq(user.id, friendRequests.from))
    .where(eq(friendRequests.to, userId));

  const outgoing = await db
    .select({
      id: friendRequests.id,
      user: getTableColumns(user),
      createdAt: friendRequests.createdAt,
    })
    .from(friendRequests)
    .innerJoin(user, eq(user.id, friendRequests.to))
    .where(eq(friendRequests.from, userId));

  return {
    incoming: incoming.map((r) => ({
      id: r.id,
      from: r.user,
      createdAt: r.createdAt,
    })),
    outgoing: outgoing.map((r) => ({
      id: r.id,
      to: r.user,
      createdAt: r.createdAt,
    })),
  };
};

export const acceptFriendRequest = async (
  userId: string,
  requestId: number,
): Promise<FriendWithChat> => {
  const [request] = await db
    .select({ from: friendRequests.from, to: friendRequests.to })
    .from(friendRequests)
    .where(and(eq(friendRequests.id, requestId), eq(friendRequests.to, userId)))
    .limit(1);

  if (!request) throw new Error("Friend request not found");

  await db.delete(friendRequests).where(eq(friendRequests.id, requestId));

  return createFriend(userId, request.from);
};

export const rejectFriendRequest = async (
  userId: string,
  requestId: number,
): Promise<void> => {
  const [request] = await db
    .select({ id: friendRequests.id })
    .from(friendRequests)
    .where(and(eq(friendRequests.id, requestId), eq(friendRequests.to, userId)))
    .limit(1);

  if (!request) throw new Error("Friend request not found");

  await db.delete(friendRequests).where(eq(friendRequests.id, requestId));
};

export const cancelFriendRequest = async (
  userId: string,
  requestId: number,
): Promise<void> => {
  const [request] = await db
    .select({ id: friendRequests.id })
    .from(friendRequests)
    .where(
      and(eq(friendRequests.id, requestId), eq(friendRequests.from, userId)),
    )
    .limit(1);

  if (!request) throw new Error("Friend request not found");

  await db.delete(friendRequests).where(eq(friendRequests.id, requestId));
};

// Group Requests
export const sendGroupRequest = async (
  fromUserId: string,
  toUserId: string,
  groupId: number,
): Promise<{ id: number; from: string; to: string; groupId: number }> => {
  if (fromUserId === toUserId)
    throw new Error("Cannot send request to yourself");

  const [groupRow] = await db
    .select({ id: group.id })
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupRow) throw new Error("Group not found");

  const [isMember] = await db
    .select({ userId: groupUser.userId })
    .from(groupUser)
    .where(
      and(eq(groupUser.groupId, groupId), eq(groupUser.userId, fromUserId)),
    )
    .limit(1);

  if (!isMember) throw new Error("Not a group member");

  const [targetUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, toUserId))
    .limit(1);

  if (!targetUser) throw new Error("User not found");

  const [alreadyMember] = await db
    .select({ userId: groupUser.userId })
    .from(groupUser)
    .where(and(eq(groupUser.groupId, groupId), eq(groupUser.userId, toUserId)))
    .limit(1);

  if (alreadyMember) throw new Error("User is already a group member");

  const [existingRequest] = await db
    .select({ id: groupRequest.id })
    .from(groupRequest)
    .where(
      and(
        eq(groupRequest.from, fromUserId),
        eq(groupRequest.to, toUserId),
        eq(groupRequest.groupId, groupId),
      ),
    )
    .limit(1);

  if (existingRequest) throw new Error("Group request already sent");

  const [newRequest] = await db
    .insert(groupRequest)
    .values({
      from: fromUserId,
      to: toUserId,
      groupId,
    })
    .returning({ id: groupRequest.id });

  return { id: newRequest.id, from: fromUserId, to: toUserId, groupId };
};

export const getGroupRequests = async (
  userId: string,
): Promise<{
  incoming: Array<{ id: number; from: DbUser; group: Group; createdAt: Date }>;
  outgoing: Array<{ id: number; to: DbUser; group: Group; createdAt: Date }>;
}> => {
  const incomingRows = await db
    .select({
      id: groupRequest.id,
      from: groupRequest.from,
      groupId: groupRequest.groupId,
      createdAt: groupRequest.createdAt,
    })
    .from(groupRequest)
    .where(eq(groupRequest.to, userId));

  const incoming = await Promise.all(
    incomingRows.map(async (row) => {
      const [fromUser] = await db
        .select(getTableColumns(user))
        .from(user)
        .where(eq(user.id, row.from))
        .limit(1);

      const groupData = await getGroup(row.groupId);

      return {
        id: row.id,
        from: fromUser,
        group: groupData,
        createdAt: row.createdAt,
      };
    }),
  );

  const outgoingRows = await db
    .select({
      id: groupRequest.id,
      to: groupRequest.to,
      groupId: groupRequest.groupId,
      createdAt: groupRequest.createdAt,
    })
    .from(groupRequest)
    .where(eq(groupRequest.from, userId));

  const outgoing = await Promise.all(
    outgoingRows.map(async (row) => {
      const [toUser] = await db
        .select(getTableColumns(user))
        .from(user)
        .where(eq(user.id, row.to))
        .limit(1);

      const groupData = await getGroup(row.groupId);

      return {
        id: row.id,
        to: toUser,
        group: groupData,
        createdAt: row.createdAt,
      };
    }),
  );

  return { incoming, outgoing };
};

export const acceptGroupRequest = async (
  userId: string,
  requestId: number,
): Promise<Group> => {
  const [request] = await db
    .select({ groupId: groupRequest.groupId, to: groupRequest.to })
    .from(groupRequest)
    .where(and(eq(groupRequest.id, requestId), eq(groupRequest.to, userId)))
    .limit(1);

  if (!request) throw new Error("Group request not found");

  await db.delete(groupRequest).where(eq(groupRequest.id, requestId));

  await db.insert(groupUser).values({
    userId,
    groupId: request.groupId,
  });

  return getGroup(request.groupId);
};

export const rejectGroupRequest = async (
  userId: string,
  requestId: number,
): Promise<void> => {
  const [request] = await db
    .select({ id: groupRequest.id })
    .from(groupRequest)
    .where(and(eq(groupRequest.id, requestId), eq(groupRequest.to, userId)))
    .limit(1);

  if (!request) throw new Error("Group request not found");

  await db.delete(groupRequest).where(eq(groupRequest.id, requestId));
};

export const cancelGroupRequest = async (
  userId: string,
  requestId: number,
): Promise<void> => {
  const [request] = await db
    .select({ id: groupRequest.id })
    .from(groupRequest)
    .where(and(eq(groupRequest.id, requestId), eq(groupRequest.from, userId)))
    .limit(1);

  if (!request) throw new Error("Group request not found");

  await db.delete(groupRequest).where(eq(groupRequest.id, requestId));
};
