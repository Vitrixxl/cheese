import { GAME_TIME_CONTROLS } from "@shared";
import z from "zod";

export const wsMessageSchema = z.union([
  z.object({
    key: z.literal("joinQueue"),
    payload: z.object({
      timeControl: z.literal(
        Object.entries(GAME_TIME_CONTROLS)
          .map(([_, k]) => k)
          .flat(),
      ),
    }),
  }),
  z.object({
    key: z.literal("quitQueue"),
    payload: z.null(),
  }),
  z.object({
    key: z.literal("challenge"),
    payload: z.object({
      id: z.string(),
      ranked: z.boolean(),
      timeControl: z.literal(
        Object.entries(GAME_TIME_CONTROLS)
          .map(([_, k]) => k)
          .flat(),
      ),
      to: z.string(),
    }),
  }),
  z.object({
    key: z.literal("cancelChallenge"),
    payload: z.object({
      challengeId: z.string(),
    }),
  }),
  z.object({
    key: z.literal("challengeResponse"),
    payload: z.object({
      challengeId: z.string(),
      response: z.boolean(),
    }),
  }),
]);
