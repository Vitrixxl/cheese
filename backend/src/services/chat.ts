import {
  chat,
  Chat,
  InsertMessage,
  message,
  usersToChats,
} from "@backend/lib/db/schema";
import { db } from "../lib/db";
import { ChatWithUsersAndMessages, User } from "@shared";

export const isInChat = async (userId: User["id"], chatId: Chat["id"]) => {
  const result = await db.query.usersToChats.findFirst({
    columns: {},
    where: (chat, w) =>
      w.and(w.eq(chat.userId, userId), w.eq(chat.chatId, chatId)),
  });
  return Boolean(result);
};

export const getChats = async (
  userId: string,
  limit: number,
  offset: number,
): Promise<ChatWithUsersAndMessages[]> => {
  const chats = await db.query.chat.findMany({
    where: (chat, w) =>
      w.inArray(
        chat.id,
        db
          .select({ chatId: usersToChats.chatId })
          .from(usersToChats)
          .where(w.eq(usersToChats.userId, userId)),
      ),
    with: {
      userLinks: { with: { user: true } },
      messages: true,
    },
    limit: limit + 1,
    offset,
  });

  return chats.map((c) => ({
    id: c.id,
    users: c.userLinks.map((ul) => ul.user),
    messages: c.messages,
  }));
};

export const getChatMessage = async (
  userId: User["id"],
  chatId: number,
  limit: number,
  offset: number,
) => {
  const exist = await db.query.chat.findFirst({
    columns: {},
    where: (chat, w) => w.eq(chat.id, chatId),
    with: {
      userLinks: { where: (userLink, w) => w.eq(userLink.userId, userId) },
    },
  });
  if (!exist) return null;
  return await db.query.message.findMany({
    with: {
      chat: true,
    },
    where: (message, w) => w.eq(message.chatId, chatId),
    orderBy: (message) => message.createdAt,
    limit: limit + 1,
    offset,
  });
};

export const insertChatMessage = async (
  userId: User["id"],
  chatId: Chat["id"],
  messagePayload: Omit<InsertMessage, "userId" | "chatId">,
) => {
  const canWrite = await isInChat(userId, chatId);
  if (!canWrite) return false;
  await db
    .insert(message)
    .values({ ...messagePayload, userId, chatId });
  return true;
};
