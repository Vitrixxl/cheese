import { TIME_CONTROL_TO_CATEGORY, type Challenge } from '@shared'
import { Button } from './ui/button'
import { LucideCheck, LucideX } from 'lucide-react'
import { UserAvatar } from './user-avatar'
import { gameIconMap } from './game-selector'
import React from 'react'

type ChallengeItemProps = {
  challenge: Challenge
  onResponse: (response: boolean) => void
}
export default function ChallengeItem({ challenge, onResponse }: ChallengeItemProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  const [width, setWidth] = React.useState(0)
  const [isHover, setIsHover] = React.useState(false)

  React.useLayoutEffect(() => {
    if (!ref.current) return
    if (!isHover) {
      setWidth(0)
      return
    }
    setWidth(ref.current.scrollWidth)
  }, [isHover])

  const Icon = gameIconMap[TIME_CONTROL_TO_CATEGORY[challenge.timeControl]]
  return (
    <div
      className="group hover:bg-accent flex items-center gap-2 rounded-lg px-2 py-1 pr-1"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <UserAvatar url={challenge.from.image} name={challenge.from.name} />
      <p className="text-muted-foreground group-hover:text-foreground font-medium transition-colors select-none">
        {challenge.from.name}
      </p>
      <div className="ml-auto flex items-center gap-1">
        <Icon
          className="ml-auto size-6"
          style={{
            color: `var(--${TIME_CONTROL_TO_CATEGORY[challenge.timeControl]}-color)`,
          }}
        />
        <Button asChild size="sm" variant="outline">
          <div className="!text-foreground !bg-input/30 select-none">{challenge.timeControl}</div>
        </Button>
      </div>
      <div
        className="flex gap-1 overflow-hidden transition-[width]"
        ref={ref}
        style={{
          width,
        }}
      >
        <Button size="icon-sm" variant={'default'} onClick={() => onResponse(true)}>
          <LucideCheck />
        </Button>
        <Button size="icon-sm" variant={'destructive'} onClick={() => onResponse(false)}>
          <LucideX />
        </Button>
      </div>
    </div>
  )
}
