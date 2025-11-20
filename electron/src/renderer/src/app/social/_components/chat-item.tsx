import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { useUser } from '@/hooks/use-user'
import { cn } from '@/lib/utils'
import type { ChatWithUsers } from '@shared'
import { Link } from 'react-router'

type ChatItemProps = {
  chat: ChatWithUsers
}

export default function ChatItem({ chat: { users, name, id, lastMessageAt } }: ChatItemProps) {
  const user = useUser()
  const chatUser = users.find((u) => user.id == u.id)
  const isSeen =
    chatUser && chatUser.lastSeenAt && lastMessageAt ? chatUser.lastSeenAt > lastMessageAt : false
  console.log({ lastMessageAt, chatUser })

  return (
    <Button
      className="flex justify-start gap-4 px-2"
      variant={'ghost'}
      asChild
      size="lg"
      onClick={() => {}}
    >
      <Link to={`chat/${id}`}>
        <div className="flex">
          {users.length == 2
            ? [users.find((u) => u.id != user.id)!].map((u, i) => (
                <UserAvatar url={u.image} name={u.name} className={cn(i % 2 != 0 && '-ml-4')} />
              ))
            : users
                .slice(1, 2)
                .map((u, i) => (
                  <UserAvatar url={u.image} name={u.name} className={cn(i % 2 != 0 && '-ml-4')} />
                ))}
        </div>
        <h3>{name || users.find((u) => u.id != user.id)?.name || 'No name (never)'}</h3>
        {!isSeen && <div className="bg-primary mr-2 ml-auto size-3 rounded-full" />}
      </Link>
    </Button>
  )
}
