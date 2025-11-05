import { Group, Message, Game } from "@backend/lib/db/schema";
import type { User } from "@backend/lib/auth";
export type { User } from "@backend/lib/auth";

export type {
  Game,
  Chat,
  Move,
  Group,
  Friends,
  GroupUser,
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
  whiteUser: User;
  blackUser: User;
}
