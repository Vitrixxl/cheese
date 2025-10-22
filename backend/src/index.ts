// export * from "./lib/auth";
// export * from "./services/chess";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { socialRoutes } from "./routes/social";

const app = new Elysia().mount(auth.handler).use(socialRoutes);
app.listen(6969);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
