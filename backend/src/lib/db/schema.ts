import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { type Color } from "chess.js";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  elo: integer().notNull().default(500),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const game = sqliteTable("game", {
  id: integer().primaryKey({ autoIncrement: true }),
  whiteId: text()
    .references(() => user.id)
    .notNull(),
  blackId: text()
    .references(() => user.id)
    .notNull(),
  outcome: text().$type<"checkmate" | "draw" | "giveup">().notNull(),
  winner: text().references(() => user.id),
  createdAt: integer({ mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});
export type Game = typeof game.$inferSelect;

export const move = sqliteTable("move", {
  id: integer().primaryKey({ autoIncrement: true }),
  turn: text().$type<Color>().notNull(),
  move: text().notNull(),
});

export type Move = typeof move.$inferSelect;

export const friend = sqliteTable("friend", {
  user1: text()
    .notNull()
    .references(() => user.id),
  user2: text()
    .notNull()
    .references(() => user.id),
  chatId: integer().references(() => chat.id),
  createdAt: integer({ mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});
export type Friends = typeof friend.$inferSelect;

export const friendRequests = sqliteTable("friend_request", {
  id: integer().primaryKey({ autoIncrement: true }),
  from: text()
    .notNull()
    .references(() => user.id),
  to: text()
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});
export type FriendRequests = typeof friendRequests.$inferSelect;

export const group = sqliteTable("group", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  chatId: integer()
    .references(() => chat.id)
    .notNull(),
});
export type Group = typeof group.$inferSelect;

export const groupRequest = sqliteTable("group_request", {
  id: integer().primaryKey({ autoIncrement: true }),
  from: text()
    .notNull()
    .references(() => user.id),
  to: text()
    .notNull()
    .references(() => user.id),
  groupId: integer("group_id")
    .notNull()
    .references(() => group.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});
export type GroupRequest = typeof groupRequest.$inferSelect;

export const groupUser = sqliteTable(
  "group_user",
  {
    userId: text()
      .references(() => user.id)
      .notNull(),
    groupId: integer()
      .references(() => group.id)
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.groupId] }),
    index("group_user_group_idx").on(t.groupId),
    index("group_user_user_idx").on(t.userId),
  ],
);
export type GroupUser = typeof groupUser.$inferSelect;

export const chat = sqliteTable("chat", {
  id: integer().primaryKey({ autoIncrement: true }),
});

export type Chat = typeof chat.$inferSelect;

export const message = sqliteTable("message", {
  id: integer().primaryKey({ autoIncrement: true }),
  chatId: integer()
    .references(() => chat.id)
    .notNull(),
  content: text(),
  gameId: integer().references(() => game.id),
});

export type Message = typeof message.$inferSelect;
