import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./backend/src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "./db.sqlite",
  },
});
