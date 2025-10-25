import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { socialRoutes } from "./routes/social";
export * from "./lib/types";

const app = new Elysia()
  .use(
    cors({
      credentials: true,
    }),
  )
  .mount(auth.handler)
  .use(socialRoutes);
app.listen(6969);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
