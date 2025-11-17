import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import z from "zod";
import {
  GAME_TIME_CONTROLS,
  GameTimeControl,
  INITIALS_TIMERS,
  TIME_CONTROL_INCREMENTS,
  User,
} from "@shared";
import { Chess, Color } from "chess.js";
import { GameInstance } from "./engine";
import { messageSchema } from "./schema";
import { WithColor, WithOptionalWS } from "./types";
import { getGameState } from "./services/game";

export const gameMap = new Map<string, GameInstance>();

const getColor = (): Color => {
  return Math.random() > 0.5 ? "w" : "b";
};

const getInitialTimer = (timeControl: GameTimeControl) => {
  return INITIALS_TIMERS[timeControl];
};

const app = new Elysia()
  .use(
    cors({
      credentials: true,
    }),
  )
  .post(
    "/create-game",
    ({ body: { timeControl, users } }) => {
      const [user1, user2] = users;
      const color = getColor();
      const newGameId = Bun.randomUUIDv7();
      const initialTimer = getInitialTimer(timeControl);
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
          timeControl,
          users: {
            [user1.id]: { ...user1, color, ws: null },
            [user2.id]: {
              ...user2,
              color: color == "w" ? "b" : ("w" as Color),
              ws: null,
            },
          },
          opponentByUserId: {
            [user2.id]: user1.id,
            [user1.id]: user2.id,
          },
          timers: {
            b: initialTimer,
            w: initialTimer,
          },
          timerIncrement: Object.keys(TIME_CONTROL_INCREMENTS).includes(
            timeControl,
          )
            ? TIME_CONTROL_INCREMENTS[
                timeControl as keyof typeof TIME_CONTROL_INCREMENTS
              ]
            : 0,
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
        users: [completUsers[user1.id], completUsers[user2.id]],
        initialTimer,
      };
    },
    {
      body: z.object({
        timeControl: z.literal(
          Object.entries(GAME_TIME_CONTROLS)
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
              puzzleLevel: z.number(),
            }),
          )
          .length(2),
      }),
    },
  )
  .get(
    "/state/:gameId",
    async ({ params: { gameId } }) => {
      return getGameState(gameId);
    },
    {
      params: z.object({
        gameId: z.string(),
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
      currentGame.dropConnection({ userId });
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
      const currentGame = gameMap.get(gameId);
      if (!currentGame || !currentGame.game.users[userId]) {
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

export type GameApi = typeof app;
