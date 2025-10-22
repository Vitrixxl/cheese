import { GAME_TYPES } from "./constants";
import type { Chess, Color } from "chess.js";
import type { User } from ".";

export type Outcome = "checkmate" | "stalemate" | "draw" | "timeout" | "resign";
export type DrawOffer = {
  userId: User["id"];
};

export type ChessGameMessage = {
  userId: User["id"];
  content: string;
};

export type ChessGame = {
  id: string;
  chess: Chess;
  players: Player[];
  timers: Record<Color, number>;
  drawOfferer: User["id"] | null;
  messages: ChessGameMessage[];
  competitive: boolean;
  outcome: Outcome | null;
  winner: Color | null;
};

export type GameType = (typeof GAME_TYPES)[keyof typeof GAME_TYPES][number];

export type Player = User & {
  color: Color;
};
