import {
  type Group,
  type Message,
  type Game,
  type Chat,
  type Elo,
  type Puzzle,
} from "@backend/lib/db/schema";
import type { User } from "@backend/lib/auth";
import type { Color } from "chess.js";
export type { User } from "@backend/lib/auth";

export type {
  Game,
  Chat,
  Move,
  Group,
  Message,
  FriendRequests,
  Puzzle,
} from "@backend/lib/db/schema";

export interface PuzzleWithColor extends Puzzle {
  color: Color;
}

export interface GroupWithUsers extends Group {
  users: User[];
}

export interface MessageWithGame extends Message {
  game: GameWithUsers | null;
}
export interface MessageWithGameAndUser extends MessageWithGame {
  user: User;
}

export interface GameWithUsers extends Game {
  white: User & { elos: Elo[] };
  black: User & { elos: Elo[] };
}

export interface UserWithElos extends User {
  elos: Elo[];
}

export type ChatWithUsers = Chat & {
  users: (User & { lastSeenAt: number | null })[];
};

export type ChatData = Chat & {
  users: User[];
};
