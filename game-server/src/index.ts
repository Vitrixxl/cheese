import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import z from "zod";
import { GAME_TYPES, GameType, INITIALS_TIMERS, User } from "@shared";
import { Chess, Color } from "chess.js";
import { GameInstance } from "./engine";
import { messageSchema } from "./schema";
import { WithColor, WithOptionalWS } from "./types";

export const gameMap = new Map<string, GameInstance>();

const getColor = (): Color => {
  return Math.random() > 0.5 ? "w" : "b";
};

const getInitialTimer = (gameType: GameType) => {
  return INITIALS_TIMERS[gameType];
};

const app = new Elysia()
  .use(
    cors({
      credentials: true,
    }),
  )
  .post(
    "/create-game",
    ({ body: { gameType, users } }) => {
      const [user1, user2] = users;
      const color = getColor();
      const newGameId = Bun.randomUUIDv7();
      const initialTimer = getInitialTimer(gameType);
      const completUsers: Record<string, WithOptionalWS<WithColor<User>>> = {
        [user1.id]: { ...user1, color, ws: null },
        [user2.id]: {
          ...user2,
          color: color == "w" ? "b" : "w",
          ws: null,
        },
      };
      gameMap.set(
        newGameId,
        new GameInstance({
          id: newGameId,
          gameType,
          users: {
            [user1.id]: { ...user1, color, ws: null },
            [user2.id]: {
              ...user2,
              color: color == "w" ? "b" : ("w" as Color),
              ws: null,
            },
          },
          opponentByUserId: {
            [user2.id]: { ...user1, color, ws: null },
            [user1.id]: { ...user2, color: color == "w" ? "b" : "w", ws: null },
          },
          timers: {
            b: initialTimer,
            w: initialTimer,
          },
          chess: new Chess(),
          drawOffer: null,
          messages: [],
          firstConRecord: {
            [user1.id]: false,
            [user2.id]: false,
          },
        }),
      );
      return {
        newGameId,
        users: Object.values(completUsers),
        initialTimer,
      };
    },
    {
      body: z.object({
        gameType: z.literal(
          Object.entries(GAME_TYPES)
            .map(([_, k]) => k)
            .flat(),
        ),
        users: z
          .array(
            z.object({
              id: z.string(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
              email: z.string(),
              emailVerified: z.boolean(),
              name: z.string(),
              image: z.string().nullable().optional(),
              elo: z.number(),
              puzzleLevel: z.number(),
            }),
          )
          .length(2),
      }),
    },
  )
  .ws("/ws", {
    open: (ws) => {
      const userId = ws.data.query.userId;
      const gameId = ws.data.query.gameId;
      const currentGame = gameMap.get(gameId)!;
      currentGame.addConnection({ userId, ws });
    },
    close: (ws, code) => {
      if (code == 1000) return;
      const userId = ws.data.query.userId;
      const gameId = ws.data.query.gameId;
      const currentGame = gameMap.get(gameId)!;
      currentGame.addConnection({ userId, ws });
    },
    message: (ws, message) => {
      const { data, error } = messageSchema.safeParse(message);
      if (error) {
        console.error(error);
        return;
      }
      const userId = ws.data.query.userId;
      const gameId = ws.data.query.gameId;
      const currentGame = gameMap.get(gameId)!;
      currentGame.handleMessage({ ...data, userId });
    },
    beforeHandle: ({ status, query: { userId, gameId } }) => {
      console.log(userId, gameId);
      const currentGame = gameMap.get(gameId);
      if (!currentGame || !currentGame.game.users[userId]) {
        console.log("erro");
        return status("Unauthorized");
      }
    },
    query: z.object({
      gameId: z.uuidv7(),
      userId: z.string(),
    }),
  })
  .listen(3001);

console.log(
  `🦊 Game server is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(`dza`);

export type GameApi = typeof app;
