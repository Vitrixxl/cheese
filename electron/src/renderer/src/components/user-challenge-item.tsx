import type { User } from '@shared'
import { UserAvatar } from './user-avatar'
import { Button } from './ui/button'
import { LucideSwords } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { GameSelector } from './game-selector'

type UserChallengeItemProps = {
  user: User
}
export default function UserChallengeItem({ user }: UserChallengeItemProps) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar url={user.image} name={user.name} />
      <p className="text-sm font-medium">{user.name}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon-sm" variant="outline" className="ml-auto">
            <LucideSwords />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" sideOffset={8} align="start">
          <GameSelector userId={user.id} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
