import { isInQueueAtom } from '@/store'
import { hubWsAtom } from '@/store/ws'
import type { WsMessage } from '@backend'
import type { Challenge, GameTimeControl } from '@shared'
import { useAtom, useAtomValue } from 'jotai'

export const useHubWsAction = () => {
  const [isInQueue, setIsInQueue] = useAtom(isInQueueAtom)
  const ws = useAtomValue(hubWsAtom)
  const enterQueue = (timeControl: GameTimeControl) => {
    if (!ws) return
    ws.send({
      key: 'joinQueue',
      payload: {
        timeControl,
      },
    } satisfies WsMessage)
    setIsInQueue(true)
  }

  const leaveQueue = () => {
    if (!ws) return
    setIsInQueue(false)
    ws.send({
      key: 'quitQueue',
      payload: null,
    } satisfies WsMessage)
  }

  const challengeFriend = (userId: string, timeControl: GameTimeControl, ranked: boolean) => {
    if (!ws) return
    ws.send({
      key: 'challenge',
      payload: {
        id: crypto.randomUUID(),
        ranked,
        to: userId,
        timeControl,
      },
    } satisfies WsMessage)
  }

  const handleChallengeResponse = (challengeId: Challenge['id'], response: boolean) => {
    if (!ws) return
    ws.send({
      key: 'challengeResponse',
      payload: {
        challengeId,
        response,
      },
    } satisfies WsMessage)
  }
  return {
    enterQueue,
    leaveQueue,
    isInQueue,
    challengeFriend,
    handleChallengeResponse,
  }
}
