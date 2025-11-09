import { Group, Message, Game, Chat, Elo } from "@backend/lib/db/schema";
import type { User } from "@backend/lib/auth";
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

export interface GroupWithUsers extends Group {
  users: User[];
}

export interface MessageWithGame extends Message {
  game?: Game;
}

export interface GameWithUsers extends Omit<Game, "whiteId" | "blackId"> {
  white: User & { elos: Elo[] };
  black: User & { elos: Elo[] };
}

export type ChatWithUsersAndMessages = Chat & {
  users: User[];
  messages: Message[];
};
