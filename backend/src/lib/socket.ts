import { CommonChessCommands, Outcome } from "@shared";
import { WSCommand } from "@socketinator/sdk/server";
import {
  Socketinator,
  SocketinatorReadEntriesConfig,
} from "@socketinator/sdk/server";
import z from "zod";
import { User } from "./auth";
import { Color } from "chess.js";

export type ChessServerCommands =
  | CommonChessCommands
  | WSCommand<"end", { winner: User["id"] | null; outcome: Outcome }>
  | WSCommand<"disconnection", null>
  | WSCommand<"reconnection", null>
  | WSCommand<"move", { move: string; timers: Record<Color, number> }>
  | WSCommand<"start", { opponent: User; color: Color; gameId: string }>;

export type ServerEnvelopes = {
  userId: User["id"];
  group: "chess";
  command: ChessServerCommands;
};

const readEnvelopes = {
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
} satisfies SocketinatorReadEntriesConfig;

export type ServerReadEnvelopes = typeof readEnvelopes;

export const socketinator = new Socketinator<
  ServerEnvelopes,
  ServerReadEnvelopes
>({
  url: "",
  readEnvelopes,
  onClose: () => {
    console.log("CLOSSEEED");
  },
  onConnect: () => {},
});
