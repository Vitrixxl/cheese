import Elysia from "elysia";
import { authMacro } from "../macros/auth";
import {
  createFriend,
  createGroup,
  deleteFriend,
  deleteGroup,
  getChatMessagesPaginated,
  getFriend,
  getFriends,
  getGroup,
  getGroups,
} from "../services/social";
import z from "zod";

export const socialRoutes = new Elysia({ prefix: "social" })
  .use(authMacro)
  .group("/friends", (g) => {
    g.guard(
      {
        auth: true,
      },
      (g) => {
        g.get("/", async ({ user }) => {
          return getFriends(user.id);
        });

        g.get("/:id", async ({ params, user, set }) => {
          try {
            return await getFriend(user.id, params.id);
          } catch (error) {
            set.status = 404;
            return {
              message: (error as Error).message,
            };
          }
        });

        g.post(
          "/",
          async ({ body, user, set }) => {
            try {
              const friend = await createFriend(user.id, body.friendId);
              set.status = 201;
              return friend;
            } catch (error) {
              const message = (error as Error).message;
              if (message === "Cannot add yourself") {
                set.status = 400;
              } else if (message === "User not found") {
                set.status = 404;
              } else if (message === "Already friends") {
                set.status = 409;
              } else {
                set.status = 500;
              }
              return { message };
            }
          },
          {
            body: z.object({
              friendId: z.string(),
            }),
          },
        );

        g.delete("/:id", async ({ params, user, set }) => {
          try {
            await deleteFriend(user.id, params.id);
            set.status = 204;
            return null;
          } catch (error) {
            const message = (error as Error).message;
            if (message === "Friend not found") {
              set.status = 404;
            } else {
              set.status = 500;
            }
            return { message };
          }
        });
        return g;
      },
    );
    return g;
  })

  .group("/groups", (g) => {
    g.guard(
      {
        auth: true,
      },
      (g) => {
        g.get("/", async ({ user, set }) => {
          try {
            return await getGroups(user.id);
          } catch (error) {
            set.status = 500;
            return {
              message: (error as Error).message,
            };
          }
        });

        g.get("/:id", async ({ params, set }) => {
          const groupId = Number(params.id);
          if (Number.isNaN(groupId)) {
            set.status = 400;
            return { message: "Invalid group id" };
          }

          try {
            return await getGroup(groupId);
          } catch (error) {
            set.status = 404;
            return {
              message: (error as Error).message,
            };
          }
        });

        g.post(
          "/",
          async ({ body, user, set }) => {
            try {
              const group = await createGroup(
                user.id,
                body.name,
                body.members ?? [],
              );
              set.status = 201;
              return group;
            } catch (error) {
              const message = (error as Error).message;
              if (message === "Group name is required") {
                set.status = 400;
              } else if (message === "Group member not found") {
                set.status = 404;
              } else {
                set.status = 500;
              }
              return { message };
            }
          },
          {
            body: z.object({
              name: z.string(),
              members: z.optional(z.array(z.string())),
            }),
          },
        );

        g.delete("/:id", async ({ params, user, set }) => {
          const groupId = Number(params.id);
          if (Number.isNaN(groupId)) {
            set.status = 400;
            return { message: "Invalid group id" };
          }

          try {
            return await deleteGroup(user.id, groupId);
          } catch (error) {
            const message = (error as Error).message;
            if (message === "Group not found") {
              set.status = 404;
            } else if (message === "Not a group member") {
              set.status = 403;
            } else {
              set.status = 500;
            }
            return { message };
          }
        });
        return g;
      },
    );
    return g;
  })
  .group("/chats", (g) => {
    g.guard(
      {
        auth: true,
      },
      (g) => {
        g.get(
          "/:id/messages",
          async ({ params, user, set, query }) => {
            const chatId = Number(params.id);
            if (Number.isNaN(chatId)) {
              set.status = 400;
              return { message: "Invalid chat id" };
            }

            const rawLimit = query.limit ? Number(query.limit) : 20;
            if (Number.isNaN(rawLimit) || rawLimit < 1) {
              set.status = 400;
              return { message: "Invalid limit" };
            }
            const limit = Math.min(Math.max(Math.floor(rawLimit), 1), 100);

            let cursor: number | undefined;
            if (query.cursor !== undefined) {
              const parsedCursor = Number(query.cursor);
              if (Number.isNaN(parsedCursor)) {
                set.status = 400;
                return { message: "Invalid cursor" };
              }
              cursor = Math.floor(parsedCursor);
              if (cursor < 0) {
                set.status = 400;
                return { message: "Invalid cursor" };
              }
            }

            try {
              return await getChatMessagesPaginated(
                user.id,
                chatId,
                limit,
                cursor,
              );
            } catch (error) {
              const message = (error as Error).message;
              if (message === "Forbidden") {
                set.status = 403;
              } else {
                set.status = 404;
              }
              return { message };
            }
          },
          {
            query: z.object({
              limit: z.optional(z.number().default(50)),
              cursor: z.optional(z.number().default(0)),
            }),
          },
        );
        return g;
      },
    );
    return g;
  });
