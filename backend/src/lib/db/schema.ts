import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { type Color } from "chess.js";
import { GAME_TYPES, Outcome } from "@shared";
import { relations } from "drizzle-orm";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  puzzleLevel: integer().notNull().default(1),
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
  id: text().primaryKey(),
  whiteId: text()
    .references(() => user.id)
    .notNull(),
  blackId: text()
    .references(() => user.id)
    .notNull(),
  outcome: text().$type<Outcome>().notNull(),
  winner: text().$type<Color>(),
  messages: text({ mode: "json" })
    .default([])
    .$type<{ userId: string; content: string }[]>(),
  whiteTimer: integer().notNull(),
  blackTimer: integer().notNull(),
  moves: integer().notNull(),
  createdAt: integer({ mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

export const move = sqliteTable("move", {
  id: integer().primaryKey({ autoIncrement: true }),
  turn: text().$type<Color>().notNull(),
  move: text().notNull(),
});

export const usersToUsers = sqliteTable("users_to_users", {
  userId1: text()
    .notNull()
    .references(() => user.id),
  userId2: text()
    .notNull()
    .references(() => user.id),
  createdAt: integer({ mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

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

export const group = sqliteTable("group", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  chatId: integer()
    .references(() => chat.id)
    .notNull(),
});

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

export const usersToGroups = sqliteTable(
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

export const chat = sqliteTable("chat", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text(),
});

export const usersToChats = sqliteTable("users_to_chats", {
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  chatId: integer("chat_id")
    .references(() => chat.id)
    .notNull(),
});

export const message = sqliteTable("message", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: text()
    .references(() => user.id)
    .notNull(),
  chatId: integer()
    .references(() => chat.id)
    .notNull(),
  content: text(),
  gameId: integer().references(() => game.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const puzzle = sqliteTable("puzzle", {
  id: integer().primaryKey({ autoIncrement: true }),
  fen: text().notNull(),
  moves: text().notNull(),
  themes: text().notNull(),
});

export const elo = sqliteTable(
  "elo",
  {
    userId: text()
      .references(() => user.id)
      .notNull(),
    gameType: text().notNull().$type<keyof typeof GAME_TYPES>(),
    elo: integer().notNull().default(500),
  },
  (t) => [primaryKey({ columns: [t.userId, t.gameType] })],
);

export const usersToGames = sqliteTable("users_to_games", {
  userId: text()
    .references(() => user.id)
    .notNull(),
  gameId: text()
    .references(() => game.id)
    .notNull(),
});

// RELATIONS

export const messagesRelations = relations(message, ({ one }) => ({
  user: one(user, { fields: [message.userId], references: [user.id] }),
  chat: one(chat, { fields: [message.chatId], references: [chat.id] }),
  game: one(game, { fields: [message.gameId], references: [game.id] }),
}));

export const chatRelations = relations(chat, ({ many }) => ({
  messages: many(message),
  userLinks: many(usersToChats),
  groups: many(group),
}));

export const groupsRelations = relations(group, ({ one, many }) => ({
  chat: one(chat, { fields: [group.chatId], references: [chat.id] }),
  userLinks: many(usersToGroups),
}));

export const gameRelations = relations(game, ({ one, many }) => ({
  white: one(user, {
    fields: [game.whiteId],
    references: [user.id],
    relationName: "white",
  }),
  black: one(user, {
    fields: [game.blackId],
    references: [user.id],
    relationName: "black",
  }),
  users: many(usersToGames),
}));

export const userRelations = relations(user, ({ many }) => ({
  messages: many(message),
  chatLinks: many(usersToChats),
  groupLinks: many(usersToGroups),
  friendLinks1: many(usersToUsers, { relationName: "user1" }),
  friendLinks2: many(usersToUsers, { relationName: "user2" }),
  games: many(usersToGames),
  elos: many(elo),
}));

export const usersToGamesRelations = relations(usersToGames, ({ one }) => ({
  user: one(user, {
    fields: [usersToGames.userId],
    references: [user.id],
  }),
  game: one(game, {
    fields: [usersToGames.gameId],
    references: [game.id],
  }),
}));

export const elosRelation = relations(elo, ({ one }) => ({
  user: one(user, {
    fields: [elo.userId],
    references: [user.id],
  }),
}));

export const usersToChatsRelations = relations(usersToChats, ({ one }) => ({
  user: one(user, {
    fields: [usersToChats.userId],
    references: [user.id],
  }),
  chat: one(chat, {
    fields: [usersToChats.chatId],
    references: [chat.id],
  }),
}));

export const usersToUsersRelations = relations(usersToUsers, ({ one }) => ({
  user1: one(user, {
    fields: [usersToUsers.userId1],
    references: [user.id],
    relationName: "user1",
  }),
  user2: one(user, {
    fields: [usersToUsers.userId2],
    references: [user.id],
    relationName: "user2",
  }),
}));

export const usersToGroupRelation = relations(usersToGroups, ({ one }) => ({
  user: one(user, {
    fields: [usersToGroups.userId],
    references: [user.id],
  }),
  group: one(group, {
    fields: [usersToGroups.groupId],
    references: [group.id],
  }),
}));

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  from: one(user, {
    fields: [friendRequests.from],
    references: [user.id],
  }),
  to: one(user, {
    fields: [friendRequests.to],
    references: [user.id],
  }),
}));

export const groupRequestsRelations = relations(groupRequest, ({ one }) => ({
  user: one(user, {
    fields: [groupRequest.id],
    references: [user.id],
  }),
  group: one(group, {
    fields: [groupRequest.groupId],
    references: [group.id],
  }),
}));

// TYPES
export type Puzzle = typeof puzzle.$inferSelect;
export type Message = typeof message.$inferSelect;
export type InsertMessage = typeof message.$inferInsert;
export type Chat = typeof chat.$inferSelect;
export type Group = typeof group.$inferSelect;
export type GroupRequest = typeof groupRequest.$inferSelect;
export type FriendRequests = typeof friendRequests.$inferSelect;
export type Move = typeof move.$inferSelect;
export type Game = typeof game.$inferSelect;
export type Elo = typeof elo.$inferSelect;
