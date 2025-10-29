import Elysia, { t } from "elysia";
import { authMacro } from "../macros/auth";
import {
  acceptFriendRequest,
  acceptGroupRequest,
  cancelFriendRequest,
  cancelGroupRequest,
  createFriend,
  createGroup,
  deleteFriend,
  deleteGroup,
  getChatMessagesPaginated,
  getFriend,
  getFriendRequests,
  getFriends,
  getGroup,
  getGroupRequests,
  getGroups,
  rejectFriendRequest,
  rejectGroupRequest,
  searchUsers,
  sendFriendRequest,
  sendGroupRequest,
} from "../services/social";
import z from "zod";

export const socialRoutes = new Elysia({ prefix: "social" })
  .use(authMacro)

  // User Search endpoint
  .get(
    "/users/search",
    async ({ query: { limit, q } }) => {
      return searchUsers(q, limit);
    },
    {
      auth: true,
      query: z.object({
        q: z.string(),
        limit: z.optional(z.number().default(10)),
      }),
    },
  )

  // Friends endpoints
  .get(
    "/friends",
    async ({ user }) => {
      return getFriends(user.id);
    },
    {
      auth: true,
    },
  )

  .get(
    "/friends/:id",
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

  .post(
    "/friends",
    async ({ body, user, set, status }) => {
      try {
        const friend = await createFriend(user.id, body.friendId);
        set.status = 201;
        return friend;
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Cannot add yourself") {
          status(400, { message });
        } else if (message === "User not found") {
          status(404, { message });
        } else if (message === "Already friends") {
          status(409, { message });
        } else {
          throw error;
        }
      }
    },
    {
      auth: true,
      body: z.object({
        friendId: z.string(),
      }),
    },
  )

  .delete(
    "/friends/:id",
    async ({ params, user, set }) => {
      try {
        await deleteFriend(user.id, params.id);
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Friend not foun") {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return { message };
      }
    },
    {
      auth: true,
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
    "/friend-requests",
    async ({ body, user, set }) => {
      try {
        const request = await sendFriendRequest(user.id, body.toUserId);
        set.status = 201;
        return request;
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Cannot send request to yourself") {
          set.status = 400;
        } else if (message === "User not found") {
          set.status = 404;
        } else if (
          message === "Already friends" ||
          message === "Friend request already sent" ||
          message === "This user already sent you a request"
        ) {
          set.status = 409;
        } else {
          set.status = 500;
        }
        return { message };
      }
    },
    {
      auth: true,
      body: z.object({
        toUserId: z.string(),
      }),
    },
  )

  .post(
    "/friend-requests/:requestId/:action",
    async ({ params, user, set }) => {
      const requestId = Number(params.requestId);
      if (Number.isNaN(requestId)) {
        set.status = 400;
        return { message: "Invalid request id" };
      }

      if (params.action !== "accept" && params.action !== "deny") {
        set.status = 400;
        return { message: "Invalid action. Use 'accept' or 'deny'" };
      }

      try {
        if (params.action === "accept") {
          const friend = await acceptFriendRequest(user.id, requestId);
          set.status = 200;
          return friend;
        } else {
          await rejectFriendRequest(user.id, requestId);
          set.status = 204;
          return null;
        }
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Friend request not found") {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return { message };
      }
    },
    {
      auth: true,
      params: z.object({
        action: z.literal(["accept", "deny"]),
        requestId: z.number(),
      }),
    },
  )

  .delete(
    "/friend-requests/:requestId",
    async ({ params, user, set }) => {
      const requestId = Number(params.requestId);
      if (Number.isNaN(requestId)) {
        set.status = 400;
        return { message: "Invalid request id" };
      }

      try {
        await cancelFriendRequest(user.id, requestId);
        set.status = 204;
        return null;
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Friend request not found") {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return { message };
      }
    },
    {
      auth: true,
    },
  )

  // Groups endpoints
  .get(
    "/groups",
    async ({ user }) => {
      return await getGroups(user.id);
    },
    {
      auth: true,
    },
  )

  .get(
    "/groups/:id",
    async ({ params: { id } }) => {
      return await getGroup(id);
    },
    {
      auth: true,
      params: z.object({
        id: z.number(),
      }),
    },
  )

  .post(
    "/groups",
    async ({ body, user, set }) => {
      const group = await createGroup(user.id, body.name, body.members ?? []);
      set.status = 201;
      return group;
    },
    {
      auth: true,
      body: z.object({
        name: z.string(),
        members: z.optional(z.array(z.string())),
      }),
    },
  )

  .delete(
    "/groups/:id",
    async ({ params: { id }, user, set }) => {
      try {
        return await deleteGroup(user.id, id);
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Group not found") {
          set.status = 404;
        } else if (message === "Not a group member") {
          set.status = 403;
        } else {
          set.status = 500;
        }
        throw error;
      }
    },
    {
      auth: true,
      params: z.object({
        id: z.number(),
      }),
    },
  )

  .get(
    "/group-requests",
    async ({ user }) => {
      return getGroupRequests(user.id);
    },
    {
      auth: true,
    },
  )

  .post(
    "/group-requests",
    async ({ body, user, status }) => {
      try {
        const request = await sendGroupRequest(
          user.id,
          body.toUserId,
          body.groupId,
        );
        return request;
      } catch (error) {
        const message = (error as Error).message;
        if (
          message === "Cannot send request to yourself" ||
          message === "Not a group member"
        ) {
          return status(400, { message });
        } else if (
          message === "User not found" ||
          message === "Group not found"
        ) {
          return status(404, { message });
        } else if (
          message === "User is already a group member" ||
          message === "Group request already sent"
        ) {
          return status(409, { message });
        }
        throw error;
      }
    },
    {
      auth: true,
      body: z.object({
        toUserId: z.string(),
        groupId: z.number(),
      }),
    },
  )

  .post(
    "/group-requests/:requestId/:action",
    async ({ params: { action, requestId }, user, set }) => {
      try {
        if (action === "accept") {
          const group = await acceptGroupRequest(user.id, requestId);
          set.status = 200;
          return group;
        } else {
          await rejectGroupRequest(user.id, requestId);
          set.status = 204;
          return null;
        }
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Group request not found") {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return { message };
      }
    },
    {
      auth: true,
      params: z.object({
        action: z.literal(["accept", "deny"]),
        requestId: z.number(),
      }),
    },
  )

  .delete(
    "/group-requests/:requestId",
    async ({ params: { requestId }, user, set }) => {
      try {
        await cancelGroupRequest(user.id, requestId);
        set.status = 204;
        return null;
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Group request not found") {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return { message };
      }
    },
    {
      auth: true,
      params: z.object({
        requestId: z.number(),
      }),
    },
  )

  .get(
    "/chats/:id/messages",
    async ({ params: { id }, user, status, query: { limit, cursor } }) => {
      try {
        return await getChatMessagesPaginated(user.id, id, limit, cursor);
      } catch (error) {
        const message = (error as Error).message;
        if (message === "Forbidden") {
          return status(403, {
            message: "not your chat",
          });
        } else {
          return status(403, {
            message: "not a chat",
          });
        }
      }
    },
    {
      auth: true,
      params: z.object({
        id: z.number(),
      }),
      query: z.object({
        limit: z.number().default(50),
        cursor: z.number().default(0),
      }),
    },
  );
