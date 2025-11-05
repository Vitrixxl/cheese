import { GAME_TYPES } from "./constants";
import type { Chess, Color } from "chess.js";
import type { OUTCOMES, User } from ".";

export type Outcome = (typeof OUTCOMES)[number];
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

export const INITIALS_TIMERS: Record<GameType, number> = {
  "1 | 0": 60_000,
  "1 | 1": 60_000,
  "2 | 1": 120_000,
  "3 | 0": 180_000,
  "3 | 2": 180_000,
  "5 | 0": 300_000,
  "10 | 5": 600_000,
  "15 | 10": 900_000,
  "30 | 0": 1_800_000,
  Daily: 86_400_000, // 1 day
  "Daily 960": 86_400_000, // same as Daily
  "Custom Long": 3_600_000, // example: 1 hour default for custom
};
export type LocalMove = {
  from: string;
  to: string;
  promotion?: string;
};
export type Challenge = {
  id: string;
  from: User;
  to: User;
  gameType: GameType;
  ranked: boolean;
};
