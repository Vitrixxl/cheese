import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import {
  useFriendRequests,
  useProcessFriendRequest,
} from "@/hooks/use-friends";
import { LucideBellRing, LucideCheck, LucideX } from "lucide-react";

export default function FriendRequetsNotifications() {
  const { data, error, isLoading } = useFriendRequests();
  const { mutate } = useProcessFriendRequest();
  if (error || isLoading || !data || data.length == 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" className="relative" variant="outline">
          <LucideBellRing />
          <span className="h-5 absolute  aspect-square rounded-full bg-primary text-primary-foreground top-0 right-0 translate-x-1/2 -translate-y-1/2">
            {data.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-md">
        {data.map((r) => (
          <div className="flex gap-2 items-center">
            <UserAvatar url={r.from.image} name={r.from.name} />
            <p className="text-muted-foreground">{r.from.name}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => mutate({ userId: r.from.id, response: false })}
            >
              <LucideX />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => mutate({ userId: r.from.id, response: true })}
            >
              <LucideCheck />
            </Button>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
