import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
  endGameDialogOpenAtom,
  gameMessagesAtom,
  colorAtom,
  currentDriverAtom,
  gameIdAtom,
  isInQueueAtom,
  playersAtom,
  timersAtom,
  drawOfferAtom,
} from '@/store'
import { tryCatch } from '@shared'
import { gameApi } from '@/lib/api'
import { auth } from '@/lib/auth'
import type { WsChessServerMessageWithKey } from '@game-server/types/schema'
import { useBoardController } from './use-board-controller'
import { gameWsAtom } from '@/store/ws'
import { useUser } from './use-user'
import { useNavigate } from 'react-router'

export default function useGameWs() {
  const [ws, setWs] = useAtom(gameWsAtom)
  const [gameId] = useAtom(gameIdAtom)
  const { data: authData } = auth.useSession()
  const navigate = useNavigate()
  const user = useUser()
  const { applyLocalMove, reset, setOutcome, loadPgn } = useBoardController()
  const setCurrentDriver = useSetAtom(currentDriverAtom)
  const setIsInQueue = useSetAtom(isInQueueAtom)
  const [color, setColor] = useAtom(colorAtom)
  const setTimers = useSetAtom(timersAtom)
  const setPlayers = useSetAtom(playersAtom)
  const setGameMessages = useSetAtom(gameMessagesAtom)
  const setEndGameDialogOpen = useSetAtom(endGameDialogOpenAtom)
  const setDrawOffer = useSetAtom(drawOfferAtom)
  const handleClose = () => {
    console.log('closing')
    setWs(null)
  }
  const handleMessage = (ev: MessageEvent<any>) => {
    const { key, payload } = ev.data as WsChessServerMessageWithKey
    switch (key) {
      case 'move': {
        console.log({ payload })
        applyLocalMove({ ...payload.move })
        break
      }
      case 'message': {
        console.log({ payload })
        setGameMessages((prev) => [...prev, payload])
        break
      }
      case 'drawOffer': {
        setDrawOffer(true)
        break
      }
      case 'start': {
        reset(color || undefined)
        break
      }
      case 'end': {
        setOutcome(payload)
        setEndGameDialogOpen(true)
        break
      }
      case 'gameState': {
        setCurrentDriver('online')
        setIsInQueue(false)
        setColor(payload.users[user.id].color)
        setTimers(payload.timers)
        setPlayers(Object.values(payload.users))
        loadPgn(payload.pgn)
        navigate('/')
        break
      }
      case 'disconnection':
      case 'connection':
    }
  }

  React.useEffect(() => {
    if (!ws) return
    reset()
    ws.on('close', handleClose)
    ws.on('message', handleMessage)
    return () => {
      ws.off('close', handleClose)
      ws.off('message', handleMessage)
      ws.close()
    }
  }, [ws])

  React.useEffect(() => {
    if (!gameId || !authData) {
      return
    }

    if (!ws) {
      const { data, error } = tryCatch(() =>
        gameApi.ws.subscribe({ query: { userId: authData.user.id, gameId } }),
      )
      if (error) {
        console.error(error)
        return
      }
      setWs(data)
      return
    }
  }, [gameId, authData])
}
