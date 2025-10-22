import { Chess } from "chess.js";
import { User } from "../lib/auth";

export const playersMap = new Map();
export const gamesMap = new Map<string, Chess>();

export const GAME_TYPES = {
  bullet: ["1|0", "1|1", "2|1"],
  blitz: ["3|0", "3|2", "5|0"],
  rapid: ["10|5", "15|10", "30|0"],
  classic: ["Daily", "Daily 960", "Custom Long"],
} as const;

export const startGame = (
  players: User[],
  gameType: (typeof GAME_TYPES)[keyof typeof GAME_TYPES][number],
) => {};
