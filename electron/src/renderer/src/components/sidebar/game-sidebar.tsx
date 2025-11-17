import { SidebarGroup, SidebarMenu } from '../ui/sidebar'
import { GAME_TIME_CONTROLS, type GameTimeControl } from '@shared'
import { Zap, Flame, Timer, Hourglass, LucideX } from 'lucide-react'
import { GameButton } from './game-button'
import React from 'react'
import { Button } from '../ui/button'
import { useHubWsAction } from '@/hooks/use-hub-ws-action'

export const gameIconMap = {
  bullet: Zap,
  blitz: Flame,
  rapid: Timer,
  classic: Hourglass,
} as const
export default function GameSidebar() {
  const { enterQueue, isInQueue, leaveQueue } = useHubWsAction()
  const [selected, setSelected] = React.useState<GameTimeControl | null>(null)
  return (
    <SidebarGroup>
      <SidebarMenu className="flex flex-col gap-4">
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
          <div className="flex w-full gap-2 overflow-hidden">
            <Button
              className="w-auto flex-1"
              size="sm"
              onClick={() => enterQueue(selected)}
              disabled={isInQueue}
            >
              {isInQueue ? 'Loading...' : 'Start'}
            </Button>
            {isInQueue && (
              <Button variant={'destructive'} onClick={() => leaveQueue()} size="icon-sm">
                <LucideX />
              </Button>
            )}
          </div>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
