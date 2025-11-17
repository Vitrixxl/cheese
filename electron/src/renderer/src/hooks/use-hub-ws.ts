import { chessChallengesAtom } from '@/store/chess-challenges'
import {
  colorAtom,
  currentDriverAtom,
  gameCategoryAtom,
  gameIdAtom,
  initialTimerAtom,
  isInQueueAtom,
  playersAtom,
  store,
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
        store.set(gameCategoryAtom, {
          timeControl: payload.timeControl,
          category: TIME_CONTROL_TO_CATEGORY[payload.timeControl],
        })
        store.set(gameIdAtom, payload.newGameId)
        store.set(currentDriverAtom, 'online')
        setTimers({ b: initialTimer, w: initialTimer })
        setTimerIncrement(TIME_CONTROL_INCREMENTS[payload.timeControl])
        store.set(isInQueueAtom, false)

        store.set(colorAtom, payload.users.find((u) => u.id == user.id)?.color || null)
        store.set(initialTimerAtom, initialTimer)
        store.set(playersAtom, payload.users)
        navigate('/')
        break
      }

      case 'declinedChallenge': {
        store.set(chessChallengesAtom, (prev) => prev.filter((c) => c.id != payload.challengeId))
        break
      }
      case 'challenge': {
        store.set(chessChallengesAtom, (prev) => [...prev, payload])
        break
      }
      case 'hasGame': {
        setGameId(payload.gameId)
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
