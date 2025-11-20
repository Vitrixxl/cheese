import { authMacro } from "@backend/macros/auth";
import { searchUsers } from "@backend/services/users";
import Elysia from "elysia";
import z from "zod";

export const usersRoutes = new Elysia({ prefix: "/users" }).use(authMacro).get(
  "/search",
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
);
