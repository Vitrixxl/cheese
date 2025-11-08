import { authMacro } from "@backend/macros/auth";
import { getProfileByUserId } from "@backend/services/profiles";
import Elysia from "elysia";
import z from "zod";

export const profilesRoutes = new Elysia({ prefix: "profiles" })
  .use(authMacro)
  .get(
    "/:userId",
    async ({ params: { userId }, status }) => {
      const result = await getProfileByUserId(userId);
      if (!result)
        return status(404, {
          message: "User not found",
        });
      return result;
    },
    {
      auth: true,
      params: z.object({
        userId: z.string(),
      }),
    },
  );
