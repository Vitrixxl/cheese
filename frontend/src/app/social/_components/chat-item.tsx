import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import type { ChatWithUsersAndMessages } from "@shared";
import { Link } from "react-router";

type ChatItemProps = {
  chat: ChatWithUsersAndMessages;
};
export default function ChatItem({
  chat: { users, messages, name, id },
}: ChatItemProps) {
  const user = useUser();
  const lastMessage = messages[messages.length - 1]?.content;
  return (
    <Button
      className="flex justify-start px-2 gap-4"
      variant={"ghost"}
      asChild
      size="lg"
    >
      <Link to={`chat/${id}`}>
        <div className="flex">
          {users.slice(1, 2).map((u, i) => (
            <UserAvatar
              url={u.image}
              name={u.name}
              className={cn(i % 2 != 0 && "-ml-4")}
            />
          ))}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h3>
            {name ||
              users.find((u) => u.id != user.id)?.name ||
              "No name (never)"}
          </h3>
          <p
            className={cn(
              "font-medium text-muted-foreground text-xs max-w-4/5 line-clamp-1 break-all text-ellipsis",

              !lastMessage && "text-xs",
            )}
          >
            {lastMessage || "No message yet"}
          </p>
        </div>
      </Link>
    </Button>
  );
}
