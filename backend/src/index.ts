import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { socialRoutes } from "./routes/social";
import { puzzleRoutes } from "./routes/puzzle";
import { gameRoutes } from "./routes/game";
import { wsRoutes } from "./routes/ws";
export * from "./lib/types";

const app = new Elysia()
  .use(
    cors({
      credentials: true,
    }),
  )
  .mount(auth.handler)
  .use(socialRoutes)
  .use(puzzleRoutes)
  .use(gameRoutes)

  .use(wsRoutes);

app.listen(6969);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
