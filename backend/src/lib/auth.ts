import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";

import { betterAuth } from "better-auth";
import * as schema from "./db/schema";
import { db } from "./db";
import { socketinator } from "./socket";
import { session } from "backend/auth-schema";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:5173"],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  user: {
    additionalFields: {
      elo: {
        type: "number",
        defaultValue: 500,
        input: false,
        required: true,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: Bun.env.AUTH_GOOGLE_ID as string,
      clientSecret: Bun.env.AUTH_GOOGLE_SECRET as string,
      redirectURI: "http://localhost:5173",
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-out") && ctx.context.session) {
        socketinator.deleteSession({
          userId: ctx.context.session.user.id,
          token: ctx.context.session.session.id,
        });
        return;
      }
      if (ctx.context.newSession || ctx.context.session) {
        const sessionData = ctx.context.session || ctx.context.newSession;
        if (!sessionData) return;

        socketinator.setSession({
          token: sessionData.session.token,
          exp: sessionData.session.expiresAt.getTime(),
          userId: sessionData.user.id,
        });
      }
    }),
  },
});

export type Auth = typeof auth;

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
