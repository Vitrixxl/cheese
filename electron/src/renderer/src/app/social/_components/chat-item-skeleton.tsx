import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";

export default function ChatItemSkeleton() {
  return (
    <div className="flex gap-2 w-full items-center">
      <div className="flex">
        <UserAvatarSkeleton />
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-4/5 h-4" />
      </div>
    </div>
  );
}
