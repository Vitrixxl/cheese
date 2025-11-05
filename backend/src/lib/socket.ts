import { CommonChessCommands, Outcome, GAME_TYPES } from "@shared";
import {
  Socketinator,
  type CommandPacket,
  type InboundCommandConfig,
  type TargetedCommandRequestEnvelope,
} from "@socketinator/sdk/server";
import { Color } from "chess.js";
import z from "zod";
import { User } from "./auth";

type UserId = User["id"];

type ChessOutboundCommand<
  Key extends string,
  Payload,
> = TargetedCommandRequestEnvelope & {
  group: "chess";
  userId: UserId;
  command: CommandPacket<Key, Payload>;
};

export type ChessServerCommands =
  | (CommonChessCommands & TargetedCommandRequestEnvelope & { userId: UserId })
  | ChessOutboundCommand<"end", { winner: UserId | null; outcome: Outcome }>
  | ChessOutboundCommand<"disconnection", null>
  | ChessOutboundCommand<"reconnection", null>
  | ChessOutboundCommand<
      "move",
      {
        move: string;
        timers: Record<Color, number>;
      }
    >
  | ChessOutboundCommand<
      "start",
      {
        opponent: User;
        color: Color;
        gameId: string;
      }
    >;

const readEnvelopes = {
  hub: {
    "join-queue": {
      schema: z.object({
        gameType: z.literal(
          Object.entries(GAME_TYPES)
            .map(([_, k]) => k)
            .flat(),
        ),
      }),
    },
    "quit-queue": {
      schema: z.object({}),
    },
    challenge: {
      schema: z.object({
        ranked: z.boolean(),
        gameType: z.literal(
          Object.entries(GAME_TYPES)
            .map(([_, k]) => k)
            .flat(),
        ),
        userId: z.number(),
      }),
    },
    "request-challenges": {
      schema: z.object(),
    },
    "cancel-challenge": { schema: z.object({ userId: z.string() }) },
  },
  chess: {
    move: {
      schema: z.object({
        move: z.string(),
        gameId: z.string(),
      }),
    },
    "draw-offer": {
      schema: z.object({
        gameId: z.string(),
      }),
    },
    "draw-response": {
      schema: z.object({
        gameId: z.string(),
        response: z.boolean(),
      }),
    },
    resign: {
      schema: z.object({
        gameId: z.string(),
      }),
    },
    message: {
      schema: z.object({
        gameId: z.string(),
        content: z.string(),
      }),
    },
  },
} satisfies InboundCommandConfig;

export type ServerReadEnvelopes = typeof readEnvelopes;

export const socketinator = new Socketinator<
  ChessServerCommands,
  ServerReadEnvelopes
>({
  url: "ws://localhost:6969",
  readEnvelopes,
  onClose: () => {
    console.log("CLOSSEEED");
  },
  onConnect: () => {},
});
