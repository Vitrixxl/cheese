import Elysia from "elysia";
import z from "zod";
import { authMacro } from "../macros/auth";
import {
  deleteGroup,
  getGroupRequests,
  getGroups,
  handleGroupRequestResponse,
  insertGroup,
  insertGroupRequest,
} from "../services/group";

export const groupRoutes = new Elysia({ prefix: "group" })
  .use(authMacro)
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
    "/groups/:groupId",
    async ({ params: { groupId }, user }) => {
      return await getGroups(user.id, [groupId]);
    },
    {
      auth: true,
      params: z.object({
        groupId: z.number(),
      }),
    },
  )
  .post(
    "/groups",
    async ({ body, status, user }) => {
      await insertGroup(
        body.name,
        body.members ? [...body.members, user.id] : [user.id],
      );
      return status(200);
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
    "/groups/:groupId",
    async ({ params: { groupId }, user, status }) => {
      const result = await deleteGroup(user.id, groupId);
      if (!result) {
        return status(404, {
          message: "Unauthorized",
        });
      }
      return status(200);
    },
    {
      auth: true,
      params: z.object({
        groupId: z.number(),
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
    "/group-requests/:groupId/:userId",
    async ({ user, params: { groupId, userId }, status }) => {
      const result = await insertGroupRequest(user.id, groupId, userId);
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
        groupId: z.number(),
        userId: z.string(),
      }),
    },
  )
  .put(
    "/group-requests/:requestId/:response",
    async ({ params: { response, requestId }, user, status }) => {
      const result = await handleGroupRequestResponse(
        user.id,
        requestId,
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
        response: z.coerce.boolean(),
        requestId: z.number(),
      }),
    },
  );
