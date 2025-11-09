import Elysia from "elysia";
import z from "zod";
import { authMacro } from "../macros/auth";
import {
  deleteFriendship,
  getFriend,
  getFriendRequests,
  getFriends,
  handleFriendRequestResponse,
  insertFriendRequest,
  searchUsers,
} from "../services/friend";

export const friendRoutes = new Elysia({ prefix: "friend" })
  .use(authMacro)
  .get(
    "/users/search",
    async ({ user, query: { limit, q } }) => {
      return await searchUsers(user.id, q, limit);
    },
    {
      auth: true,
      query: z.object({
        q: z.string(),
        limit: z.optional(z.number().default(10)),
      }),
    },
  )
  .get(
    "/",
    async ({ user }) => {
      return getFriends(user.id);
    },
    {
      auth: true,
    },
  )
  .get(
    "/:id",
    async ({ params, user, status }) => {
      const result = await getFriend(user.id, params.id);
      if (!result) {
        status(404, {
          message: "You're not friend sorry",
        });
      }
      return result;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .delete(
    "/:userId",
    async ({ params: { userId }, user, status }) => {
      const result = await deleteFriendship(user.id, userId);
      if (!result) {
        status(403, {
          message: "Unauthorized",
        });
      }
      return status("OK");
    },
    {
      auth: true,
      params: z.object({
        userId: z.string(),
      }),
    },
  )
  .get(
    "/friend-requests",
    async ({ user }) => {
      return getFriendRequests(user.id);
    },
    {
      auth: true,
    },
  )
  .post(
    "/friend-request/new/:userId",
    async ({ user, params: { userId }, status }) => {
      const result = await insertFriendRequest(user.id, userId);
      if (result == null) {
        return status(403, {
          message: "Unauthorized",
        });
      }
      if (!result) {
        return status(404, {
          message: "Unkown user",
        });
      }

      return status(201);
    },
    {
      auth: true,
      params: z.object({
        userId: z.string(),
      }),
    },
  )
  .post(
    "friend-request/response/:userId",
    async ({ user, params: { userId }, query: { response }, status }) => {
      const result = await handleFriendRequestResponse(
        user.id,
        userId,
        response,
      );
      if (!result) {
        return status(403, {
          message: "Unauthorized",
        });
      }
      return status(200);
    },
    {
      auth: true,
      params: z.object({
        userId: z.string(),
      }),
      query: z.object({
        response: z.coerce.boolean(),
      }),
    },
  );
