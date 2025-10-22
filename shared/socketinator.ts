import { type Color } from "chess.js";
import type { Outcome } from "./chess";
import type { User } from "./entity";
import type { WSCommand } from "@socketinator/sdk/server";

export type CommonChessCommands =
  | WSCommand<"draw-offer", { gameId: string }>
  | WSCommand<"draw-response", { response: boolean; gameId: string }>
  | WSCommand<"resign", { gameId: string }>
  | WSCommand<"message", { content: string; gameId: string }>;

type ChessClientCommands =
  | CommonChessCommands
  | WSCommand<"move", { move: string; gameId: string }>;

export type ClientsCommands = ChessClientCommands;

export type ClientsEnvelopes = {
  group: "chess";
  command: ChessClientCommands;
};

export interface ClientsEnvelopesWithUserId extends ClientsEnvelopes {
  userId: User["id"];
}

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
