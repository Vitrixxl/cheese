import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import type { User } from '@shared'
import { Link } from 'react-router'

type UserItemProps = {
  user: User
}
export default function UserItem({ user }: UserItemProps) {
  return (
    <Button className="group flex justify-start gap-2" variant={'ghost'} asChild>
      <Link to={`user/${user.id}`}>
        <UserAvatar url={user.image} name={user.name} size="sm" />

        <span className="text-muted-foreground group-hover:text-foreground inline-flex gap-2 text-sm transition-colors">
          <span className="line-clamp-1 text-ellipsis">{user.name}</span>
        </span>
      </Link>
    </Button>
  )
}
