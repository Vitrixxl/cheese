import { wsMessageSchema } from "@backend/lib/schema";
import { authMacro } from "@backend/macros/auth";
import { hubService } from "@backend/services/hub";
import Elysia from "elysia";

export const wsRoutes = new Elysia({ prefix: "/ws" }).use(authMacro).ws("/", {
  open: (ws) => {
    hubService.handleConnection({ user: ws.data.user, ws });
  },
  close: (ws) => {
    hubService.handleDisconnection({ user: ws.data.user, ws });
  },
  message: async (ws, message) => {
    const { data, error } = await wsMessageSchema.safeParseAsync(message);
    if (error) {
      console.error(error);
      return;
    }
    hubService.handleMessage({ ...data, user: ws.data.user });
  },
  auth: true,
});
