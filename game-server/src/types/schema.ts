import { messageSchema } from "@game-server/schema";
import { LocalMove, Outcome, User } from "@shared";
import z from "zod";
import { GameState, ServerGame } from "./game";

export type ChessClientMessage = z.infer<typeof messageSchema>;
export type ChessServerMessages = {
  gameStatus: Pick<ServerGame, "timeControl" | "timers" | "messages"> & {
    opponent: User;
  };

  move: {
    move: LocalMove;
    timers: Record<User["id"], number>;
  };
  message: {
    userId: User["id"];
    content: string;
  };
  drawOffer: null;
  start: null;
  end: {
    winner: User["id"] | null;
    outcome: Outcome;
  };
  gameState: GameState;
  disconnection: null;
  connection: null;
};
export type WsChessServerMessageWithKey = {
  [K in keyof ChessServerMessages]: {
    key: K;
    payload: ChessServerMessages[K];
  };
}[keyof ChessServerMessages];
