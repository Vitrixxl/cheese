import { chessChallengesAtom } from '@/store/chess-challenges'
import {
  colorAtom,
  currentDriverAtom,
  gameCategoryAtom,
  gameIdAtom,
  initialTimerAtom,
  isInQueueAtom,
  playersAtom,
  store
} from '@/store'
import type { WsServerMessageWithKey } from '@backend'
import React from 'react'
import { useAtom } from 'jotai'
import { hubWsAtom } from '@/store/ws'
import { INITIALS_TIMERS, TIME_CONTROL_TO_CATEGORY, tryCatch } from '@shared'
import { api } from '@/lib/api'
import { auth } from '@/lib/auth'
import { useNavigate } from 'react-router'

export default function useHubWs() {
  const [ws, setWs] = useAtom(hubWsAtom)
  const { data: authData } = auth.useSession()
  const handleClose = () => {
    setWs(null)
  }
  const navigate = useNavigate()
  const handleMessage = React.useEffectEvent((ws: MessageEvent<any>) => {
    if (!authData) return
    const { user } = authData
    const { key, payload } = ws.data as WsServerMessageWithKey
    console.log({ data: ws.data })

    switch (key) {
      case 'game': {
        const initialTimer = INITIALS_TIMERS[payload.timeControl]
        store.set(gameCategoryAtom, {
          timeControl: payload.timeControl,
          category: TIME_CONTROL_TO_CATEGORY[payload.timeControl]
        })
        store.set(gameIdAtom, payload.newGameId)
        store.set(currentDriverAtom, 'online')
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
    }
  })
  React.useEffect(() => {
    if (!ws) {
      const { data, error } = tryCatch(api.ws.subscribe)
      if (error) {
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
