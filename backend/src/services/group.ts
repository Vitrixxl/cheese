import {
  chat,
  group,
  Group,
  groupRequest,
  usersToChats,
  usersToGroups,
} from "@backend/lib/db/schema";
import { db } from "../lib/db";
import { User } from "@shared";
import { and, eq } from "drizzle-orm";

export const isInGroup = async (
  userId: User["id"],
  groupId: Group["id"],
) => {
  const result = await db.query.usersToGroups.findFirst({
    columns: {},
    where: (usersToGroups, w) =>
      w.and(
        w.eq(usersToGroups.groupId, groupId),
        w.eq(usersToGroups.userId, userId),
      ),
  });
  return Boolean(result);
};

export const getGroups = async (
  userId: User["id"],
  groupIds?: Group["id"][],
) => {
  let targetGroupIds = groupIds;
  if (!targetGroupIds) {
    const result = await db.query.usersToGroups.findMany({
      columns: { groupId: true },
      where: (usersToGroups, w) => w.eq(usersToGroups.userId, userId),
    });
    targetGroupIds = result.map((g) => g.groupId);
  }
  if (!targetGroupIds || targetGroupIds.length === 0) {
    return [];
  }
  const result = await db.query.group.findMany({
    with: {
      userLinks: {
        columns: {},
        with: {
          user: true,
        },
        where: (userLink, w) => w.ne(userLink.userId, userId),
      },
    },
    where: (group, w) => w.inArray(group.id, targetGroupIds!),
  });
  return result.map((r) => ({
    id: r.id,
    name: r.name,
    chatId: r.chatId,
    users: r.userLinks.map((u) => u.user),
  }));
};

export const insertGroup = async (name: string, member: User["id"][]) => {
  const [{ chatId }] = await db
    .insert(chat)
    .values({})
    .returning({ chatId: chat.id });

  const [{ groupId }] = await db
    .insert(group)
    .values({ chatId, name })
    .returning({ groupId: group.id });
  await db
    .insert(usersToChats)
    .values(member.map((userId) => ({ chatId, userId })));
  await db
    .insert(usersToGroups)
    .values(member.map((userId) => ({ groupId, userId })));
};

export const deleteGroup = async (userId: User["id"], groupId: Group["id"]) => {
  const canWrite = await isInGroup(userId, groupId);
  if (!canWrite) return null;
  await db.delete(group).where(eq(group.id, groupId));
  return true;
};

export const getGroupRequests = async (userId: User["id"]) => {
  return await db.query.groupRequest.findMany({
    columns: {},
    with: {
      group: true,
    },
    where: (groupRequest, w) => w.eq(groupRequest.to, userId),
  });
};

export const insertGroupRequest = async (
  userId: string,
  groupId: Group["id"],
  to: User["id"],
) => {
  const canWrite = await isInGroup(userId, groupId);
  if (!canWrite) return null;
  await db.insert(groupRequest).values({
    from: userId,
    to,
    groupId,
  });
  return true;
};

export const handleGroupRequestResponse = async (
  userId: User["id"],
  groupId: Group["id"],
  response: boolean,
) => {
  const result = await db.query.groupRequest.findFirst({
    where: (groupRequest, w) =>
      w.and(w.eq(groupRequest.to, userId), w.eq(groupRequest.groupId, groupId)),
  });
  if (!result) return null;
  await db
    .delete(groupRequest)
    .where(and(eq(groupRequest.groupId, groupId), eq(groupRequest.to, userId)));
  if (!response) {
    return true;
  }
  await db.insert(usersToGroups).values({
    groupId,
    userId,
  });
  return true;
};
