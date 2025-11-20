import {
  colorAtom,
  currentDriverAtom,
  gameCategoryAtom,
  gameIdAtom,
  isInQueueAtom,
  playersAtom,
  timerIncrementAtom,
  timersAtom,
} from '@/store'
import type { WsServerMessageWithKey } from '@backend'
import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { hubWsAtom } from '@/store/ws'
import {
  INITIALS_TIMERS,
  TIME_CONTROL_INCREMENTS,
  TIME_CONTROL_TO_CATEGORY,
  tryCatch,
} from '@shared'
import { api } from '@/lib/api'
import { auth } from '@/lib/auth'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAppendMessage } from './use-chats'
import { challengesAtom } from '@/store/hub'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { gameIconMap } from '@/components/game-selector'

export default function useHubWs() {
  const [ws, setWs] = useAtom(hubWsAtom)
  const setGameId = useSetAtom(gameIdAtom)
  const setCurrentDriver = useSetAtom(currentDriverAtom)
  const setIsInQueue = useSetAtom(isInQueueAtom)
  const setColor = useSetAtom(colorAtom)
  const setTimers = useSetAtom(timersAtom)
  const setPlayers = useSetAtom(playersAtom)
  const setGameCategory = useSetAtom(gameCategoryAtom)
  const setTimerIncrement = useSetAtom(timerIncrementAtom)
  const setChallenge = useSetAtom(challengesAtom)
  const appendMessage = useAppendMessage()
  const { data: authData } = auth.useSession()
  const handleClose = () => {
    setWs(null)
  }
  const navigate = useNavigate()
  const handleMessage = React.useEffectEvent((ws: MessageEvent<any>) => {
    if (!authData) return
    const { user } = authData
    const { key, payload } = ws.data as WsServerMessageWithKey

    switch (key) {
      case 'game': {
        const initialTimer = INITIALS_TIMERS[payload.timeControl]
        setGameCategory({
          timeControl: payload.timeControl,
          category: TIME_CONTROL_TO_CATEGORY[payload.timeControl],
        })
        setGameId(payload.newGameId)
        setCurrentDriver('online')
        setIsInQueue(false)
        setTimers({ b: initialTimer, w: initialTimer })
        setColor(payload.users.find((u) => u.id == user.id)?.color || null)
        setTimerIncrement(TIME_CONTROL_INCREMENTS[payload.timeControl])
        setPlayers(payload.users)
        navigate('/')
        break
      }

      case 'message': {
        if (payload.message.game) {
          toast(`${payload.message.user.name} shared a game with you`)
        }
        toast('New message', {
          description: (
            <div className="flex gap-2">
              <p className="font-semibold">{payload.message.user.name} : </p>
              <p className="break-all text-ellipsis">{payload.message.content}</p>
            </div>
          ),
        })
        appendMessage(payload.chatId, payload.message)
        break
      }

      case 'challenge': {
        setChallenge((prev) => [...prev, payload])

        const Icon = gameIconMap[TIME_CONTROL_TO_CATEGORY[payload.timeControl]]
        toast(
          <div className="flex w-full flex-1 items-center gap-2">
            <UserAvatar name={payload.from.name} url={payload.from.image} />
            <p className="text-sm font-medium">{payload.from.name}</p>
            <div className="ml-auto flex items-center gap-1">
              <Icon
                className="ml-auto size-6"
                style={{
                  color: `var(--${TIME_CONTROL_TO_CATEGORY[payload.timeControl]}-color)`,
                }}
              />
              <Button asChild size="sm" variant="outline">
                <div className="!text-foreground !bg-input/30 select-none">
                  {payload.timeControl}
                </div>
              </Button>
            </div>
          </div>,
        )
        break
      }
      case 'state': {
        if (payload.gameId) {
          setGameId(payload.gameId)
        }
        setChallenge(payload.challenges)
      }
    }
  })
  React.useEffect(() => {
    if (!ws) {
      const { data, error } = tryCatch(api.ws.subscribe)
      if (error) {
        console.log({ error })
        return
      }
      setWs(data)
      return
    }
    ws.on('close', handleClose)
    ws.on('message', handleMessage)
    return () => {
      ws.off('close', handleClose)
      ws.off('message', handleMessage)
      ws.close()
    }
  }, [ws])

  return { hubWs: ws }
}
