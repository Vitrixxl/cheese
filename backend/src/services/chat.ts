import {
  chat,
  type Chat,
  type Message,
  message,
  usersToChats,
} from "@backend/lib/db/schema";
import { db } from "../lib/db";
import { type ChatWithUsers, type MessageWithGame, type User } from "@shared";
import { and, eq } from "drizzle-orm";
import { hubService } from "./hub";

export const isInChat = async (userId: User["id"], chatId: Chat["id"]) => {
  const result = await db.query.usersToChats.findFirst({
    where: (chat, w) =>
      w.and(w.eq(chat.userId, userId), w.eq(chat.chatId, chatId)),
  });
  return Boolean(result);
};

export const getChats = async (
  userId: string,
  limit: number,
  offset: number,
): Promise<ChatWithUsers[]> => {
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
    },
    limit: limit + 1,
    offset,
  });

  return chats.map((c) => ({
    id: c.id,
    name: c.name,
    users: c.userLinks.map((ul) => ({ ...ul.user, lastSeenAt: ul.lastSeenAt })),
    lastMessageAt: c.lastMessageAt,
  }));
};

export const getChat = async (
  chatId: Chat["id"],
  userId: User["id"],
): Promise<ChatWithUsers | null> => {
  const canRead = await isInChat(userId, chatId);
  if (!canRead) return null;
  const result = await db.query.chat.findFirst({
    where: (chat, w) => w.eq(chat.id, chatId),
    with: {
      userLinks: { with: { user: true } },
    },
  });
  if (!result) return null;
  return {
    ...result,
    users: result.userLinks.map((ul) => ({
      ...ul.user,
      lastSeenAt: ul.lastSeenAt,
    })),
  };
};

export const updateLastSeen = async (
  userId: User["id"],
  chatId: Chat["id"],
) => {
  await db
    .update(usersToChats)
    .set({
      lastSeenAt: Date.now(),
    })
    .where(
      and(eq(usersToChats.chatId, chatId), eq(usersToChats.userId, userId)),
    );
};

export const getChatMessages = async (
  userId: User["id"],
  chatId: number,
  limit: number,
  offset: number,
): Promise<MessageWithGame[] | null> => {
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
      game: {
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
      },
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
  messagePayload: Omit<Message, "userId" | "chatId" | "createdAt">,
) => {
  const canWrite = await isInChat(userId, chatId);
  if (!canWrite) return false;
  await db.insert(message).values({ ...messagePayload, userId, chatId });
  await db.update(chat).set({ lastMessageAt: Date.now() });
  const users = await db.query.usersToChats.findMany({
    where: (utc, w) =>
      w.and(w.eq(utc.chatId, chatId), w.ne(utc.userId, userId)),
  });
  const messageWithGame = await db.query.message.findFirst({
    with: {
      user: true,
      game: {
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
      },
    },
    where: (message, w) => w.eq(message.id, messagePayload.id),
  });
  if (!messageWithGame) return;

  hubService.sendMessage(
    users.map((u) => u.userId),
    chatId,
    messageWithGame,
  );

  return true;
};
