import { messageSchema } from "@game-server/schema";
import { LocalMove, Outcome, User } from "@shared";
import z from "zod";
import { Game } from "./game";

export type ChessClientMessage = z.infer<typeof messageSchema>;
export type ChessServerMessages = {
  gameStatus: Pick<Game, "gameType" | "timers" | "messages"> & {
    opponent: User;
  };

  move: {
    move: LocalMove;
    timers: Record<User["id"], number>;
  };
  message: {
    content: string;
  };
  drawOffer: null;
  start: null;
  end: {
    winner: User["id"] | null;
    outcome: Outcome;
  };
  disconnection: null;
  connection: null;
};
