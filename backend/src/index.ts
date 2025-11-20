import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { chatRoutes } from "./routes/chat";
import { friendRoutes } from "./routes/friend";
import { groupRoutes } from "./routes/group";
import { puzzleRoutes } from "./routes/puzzle";
import { gameRoutes } from "./routes/game";
import { wsRoutes } from "./routes/ws";
import { profilesRoutes } from "./routes/profile";
import { usersRoutes } from "./routes/users";
export * from "./lib/types";

const app = new Elysia()
  .use(
    cors({
      credentials: true,
    }),
  )
  .mount(auth.handler)
  .use(friendRoutes)
  .use(chatRoutes)
  .use(groupRoutes)
  .use(profilesRoutes)
  .use(puzzleRoutes)
  .use(gameRoutes)
  .use(usersRoutes)
  .use(wsRoutes);

app.listen(6969);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
