import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import type { ChatWithUsersAndMessages } from "@shared";

type ChatItemProps = {
  chat: ChatWithUsersAndMessages;
};
export default function ChatItem({
  chat: { users, messages, name },
}: ChatItemProps) {
  const user = useUser();
  return (
    <div className="flex gap-2">
      <div className="flex">
        {users.slice(1, 2).map((u, i) => (
          <UserAvatar
            url={u.image}
            name={u.name}
            className={cn(i % 2 == 0 && "-ml-4")}
          />
        ))}
      </div>
      <div className="flex flex-col ">
        <h3>
          {name ||
            users.find((u) => u.id != user.id)?.name ||
            "No name (never)"}
        </h3>
        <p>{messages[messages.length - 1].content}</p>
      </div>
    </div>
  );
}
