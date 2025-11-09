import Elysia from "elysia";
import z from "zod";
import { authMacro } from "../macros/auth";
import { getChatMessage, getChats, insertChatMessage } from "../services/chat";

export const chatRoutes = new Elysia({ prefix: "chats" })
  .use(authMacro)
  .get(
    "/",
    async ({ query: { limit, cursor }, user }) => {
      const chats = await getChats(user.id, limit, cursor);
      return {
        chats: chats.length > limit ? chats.slice(0, limit) : chats,
        nextCursor: chats.length > limit ? cursor + limit : null,
      };
    },
    {
      auth: true,
      query: z.object({
        limit: z.coerce.number().default(50),
        cursor: z.coerce.number().default(0),
      }),
    },
  )
  .get(
    "/messages/:chatId",
    async ({ params: { chatId }, user, status, query: { limit, cursor } }) => {
      const messages = await getChatMessage(user.id, chatId, limit, cursor);
      if (messages == null) {
        return status(403, {
          message: "Unauthorized",
        });
      }

      return {
        messages: messages.length > limit ? messages.slice(0, limit) : messages,
        nextCursor: messages.length > limit ? cursor + limit : null,
      };
    },
    {
      auth: true,
      params: z.object({
        chatId: z.coerce.number(),
      }),
      query: z.object({
        limit: z.coerce.number().default(50),
        cursor: z.coerce.number().default(0),
      }),
    },
  )
  .post(
    "/messages/:chatId",
    async ({ params: { chatId }, user, status, body }) => {
      const result = await insertChatMessage(user.id, chatId, body);
      if (!result) {
        return status("Unauthorized", {
          message: "Unauthorized",
        });
      }
      return status("Created");
    },
    {
      auth: true,
      params: z.object({
        chatId: z.coerce.number(),
      }),
      body: z.object({
        content: z.string().optional(),
        gameId: z.string().optional(),
      }),
    },
  );
