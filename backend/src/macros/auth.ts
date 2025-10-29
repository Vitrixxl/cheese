import Elysia from "elysia";
import { auth } from "../lib/auth";
import { socketinator } from "@backend/lib/socket";

export const authMacro = new Elysia().macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });
      if (!session) {
        return status(401, {
          message: "Unauthorized",
        });
      }
      socketinator.setSession({
        userId: session.user.id,
        token: session.session.token,
        exp: session.session.expiresAt.getTime(),
      });
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
