import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatarSkeleton } from '@/components/user-avatar'

export default function ChatItemSkeleton() {
  return (
    <div className="flex w-full items-center gap-2">
      <div className="flex">
        <UserAvatarSkeleton />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}
