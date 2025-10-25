import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import * as schema from "./db/schema";
import { db } from "./db";

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
        default: 500,
        input: false,
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
});

export type Auth = typeof auth;

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
