import { GameType, User } from "@shared";
import { Chess, Color } from "chess.js";
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
  gameType: GameType;
  chess: Chess;
  drawOffer: User["id"] | null;
  timers: Record<Color, number>;
  messages: {
    userId: User["id"];
    content: string;
  }[];
  firstConRecord: Record<User["id"], boolean>;
};
