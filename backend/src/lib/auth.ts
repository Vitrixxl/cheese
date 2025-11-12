import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";

import { betterAuth } from "better-auth";
import * as schema from "./db/schema";
import { db } from "./db";
import { GAME_TIME_CONTROLS } from "@shared";

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
      if (ctx.path.startsWith("/callback") && ctx.context.newSession) {
        const userId = ctx.context.newSession.user.id;
        const exist = await db.query.elo.findFirst({
          where: (elo, w) => w.eq(elo.userId, userId),
        });

        if (exist) return;

        await db.insert(schema.elo).values(
          Object.keys(GAME_TIME_CONTROLS).map((k) => ({
            userId,
            category: k as keyof typeof GAME_TIME_CONTROLS,
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
