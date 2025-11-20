import { type GameTimeControl, type User } from "@shared";
import { Chess, type Color } from "chess.js";
import { ElysiaWS } from "elysia/ws";

export type WithColor<T> = {
  color: Color;
} & T;
export type WithOptionalWS<T> = {
  ws: ElysiaWS | null;
} & T;

export type ServerGame = {
  id: string;
  users: Record<User["id"], WithOptionalWS<WithColor<User>>>;
  opponentByUserId: Record<User["id"], User["id"]>;
  timeControl: GameTimeControl;
  chess: Chess;
  /**
   * The id of the user who offered the draw
   */
  drawOffer: User["id"] | null;
  timers: Record<Color, number>;
  timerIncrement: number;
  messages: {
    userId: User["id"];
    content: string;
  }[];
  firstConRecord: Record<User["id"], boolean>;
};

export type GameState = Omit<
  ServerGame,
  "firstConRecord" | "chess" | "opponentByUserId"
> & {
  pgn: string;
};
