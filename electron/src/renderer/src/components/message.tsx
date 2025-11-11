import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@shared";
import { type User } from "better-auth";
import { UserAvatar } from "./user-avatar";

type MessageProps = {
  user: User;
  message: MessageType;
  isOwn: boolean;
};

export const ChatMessage = ({ user, message, isOwn }: MessageProps) => {
  return (
    <div
      className={cn(
        "w-4/5 flex flex-col gap-1",
        isOwn ? "ml-auto items-end" : "mr-auto",
      )}
    >
      <div className="flex gap-2 items-center ">
        <p className="text-muted-foreground text-sm">
          {isOwn ? "You" : user.name}
        </p>
        <UserAvatar url={user.image} name={user.name} />
      </div>
      <div
        className={cn(
          "rounded-lg px-2 py-1 break-all",
          isOwn ? "bg-primary text-primary-foreground" : "bg-secondary",
        )}
      >
        {message.content}
      </div>
    </div>
  );
};
