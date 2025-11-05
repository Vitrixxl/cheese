import { wsMessageSchema } from "@backend/lib/schema";
import { authMacro } from "@backend/macros/auth";
import {
  matchmakingService,
  matchmakingServiceMessageKeys,
} from "@backend/services/hub";
import Elysia from "elysia";

export const wsRoutes = new Elysia({ prefix: "/ws" }).use(authMacro).ws("/", {
  open: (ws) => {
    matchmakingService.handleConnection({ user: ws.data.user, ws });
  },
  close: (ws) => {
    matchmakingService.handleDisconnection({ user: ws.data.user, ws });
  },
  message: async (ws, message) => {
    const { data, error } = await wsMessageSchema.safeParseAsync(message);
    if (error) {
      console.error(error);
      return;
    }
    if (matchmakingServiceMessageKeys.includes(data.key)) {
      matchmakingService.handleMessage({ ...data, user: ws.data.user });
    }
  },
  auth: true,
});
