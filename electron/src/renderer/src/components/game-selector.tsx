import { GAME_TIME_CONTROLS, type GameTimeControl } from '@shared'
import React from 'react'
import { GameButton } from './game-button'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { useHubWsAction } from '@/hooks/use-hub-ws-action'
import { Flame, Hourglass, LucideX, Timer, Zap } from 'lucide-react'
export const gameIconMap = {
  bullet: Zap,
  blitz: Flame,
  rapid: Timer,
  classic: Hourglass,
} as const

type GameSelectorProps = {
  userId?: string
}
export const GameSelector = ({ userId }: GameSelectorProps) => {
  const { leaveQueue, enterQueue, challengeFriend, isInQueue } = useHubWsAction()
  const [selected, setSelected] = React.useState<GameTimeControl | null>(null)
  const [ranked, setRanked] = React.useState(true)

  const handleStart = () => {
    if (!selected) return
    if (!userId) {
      enterQueue(selected)
      return
    }
    challengeFriend(userId, selected, ranked)
  }

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(GAME_TIME_CONTROLS).map(([k]) => (
        <GameButton
          key={k}
          category={k as keyof typeof GAME_TIME_CONTROLS}
          icon={gameIconMap[k as keyof typeof GAME_TIME_CONTROLS]}
          selected={selected}
          onSelect={(tc) => (selected == tc ? setSelected(null) : setSelected(tc))}
        />
      ))}
      {selected && (
        <div className="flex flex-col gap-2">
          <label className="flex gap-2 text-sm select-none">
            <Switch onCheckedChange={setRanked} checked={ranked} />
            <span className="font-semibold">Ranked</span>
          </label>
          <div className="flex w-full gap-2 overflow-hidden">
            <Button className="w-auto flex-1" size="sm" onClick={handleStart} disabled={isInQueue}>
              {isInQueue ? 'Loading...' : 'Start'}
            </Button>
            {isInQueue && (
              <Button variant={'destructive'} onClick={() => leaveQueue()} size="icon-sm">
                <LucideX />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
