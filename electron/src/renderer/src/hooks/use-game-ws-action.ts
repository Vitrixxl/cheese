import { drawOfferAtom } from '@/store'
import { gameWsAtom } from '@/store/ws'
import type { ChessClientMessage } from '@game-server/types'
import { useAtomValue, useSetAtom } from 'jotai'

export const useGameWsAction = () => {
  const ws = useAtomValue(gameWsAtom)
  const setDrawOffer = useSetAtom(drawOfferAtom)

  const offerDraw = () => {
    if (!ws) return
    ws.send({
      key: 'drawOffer',
      payload: null,
    } satisfies ChessClientMessage)
  }

  const resign = () => {
    if (!ws) return
    ws.send({
      key: 'resign',
      payload: null,
    } satisfies ChessClientMessage)
  }

  const handleDrawResponse = (response: boolean) => {
    if (!ws) return
    setDrawOffer(false)
    ws.send({
      key: 'drawResponse',
      payload: { response },
    } satisfies ChessClientMessage)
  }

  return {
    offerDraw,
    resign,
    handleDrawResponse,
  }
}
