import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";

import { betterAuth } from "better-auth";
import * as schema from "./db/schema";
import { db } from "./db";
import { GAME_TYPES } from "@shared";

export const auth = betterAuth({
  baseURL: "http://localhost:6969",
  trustedOrigins: ["http://localhost:5173"],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  user: {
    additionalFields: {
      puzzleLevel: {
        type: "number",
        defaultValue: 0,
        input: false,
        required: true,
      },
      bio: {
        type: "string",
        defaultValue: null,
        input: false,
        required: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: Bun.env.AUTH_GOOGLE_ID as string,
      clientSecret: Bun.env.AUTH_GOOGLE_SECRET as string,
      // redirectURI: "http://localhost:5173",
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      console.log({ path: ctx.path });
      if (ctx.path.startsWith("/callback") && ctx.context.newSession) {
        const userId = ctx.context.newSession.user.id;
        await db.insert(schema.elo).values(
          Object.keys(GAME_TYPES).map((k) => ({
            userId,
            gameType: k as keyof typeof GAME_TYPES,
            elo: 500,
          })),
        );
      }
    }),
  },
});

export type Auth = typeof auth;

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
