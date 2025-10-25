import { User } from "better-auth";
import { Group } from "@backend/lib/db/schema";
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
} from "@backend/lib/db/schema";

export interface GroupWithUsers extends Group {
  users: User[];
}
