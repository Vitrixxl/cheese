import { ValidationError } from "elysia";
import type { WithOptionalWS, WithColor, GameState } from "@game-server/types";
import z from "zod";
import { wsMessageSchema } from "./schema";
import type { Challenge, GameTimeControl, User } from "@shared";

export type UnauthorizedError = {
  status: 401;
  value: {
    message: "Unauthorized";
  };
};

export type ApiError =
  | {
      status: number;
      value: {
        message: string;
      } & { [x: string]: any };
    }
  | UnauthorizedError
  | ValidationError;

export type WsMessage = z.infer<typeof wsMessageSchema>;

export type WsServerMessage = {
  game: {
    newGameId: string;
    timeControl: GameTimeControl;
    users: WithColor<WithOptionalWS<User>>[];
  };
  hasGame: {
    gameId: string;
  };
  declinedChallenge: {
    challengeId: string;
  };
  challenge: Challenge;
};

export type WsServerMessageWithKey = {
  [K in keyof WsServerMessage]: {
    key: K;
    payload: WsServerMessage[K];
  };
}[keyof WsServerMessage];
