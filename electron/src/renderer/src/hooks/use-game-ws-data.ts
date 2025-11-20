import { drawOfferAtom } from '@/store'
import { useAtomValue } from 'jotai'

export const useGameWsData = () => {
  const drawOffer = useAtomValue(drawOfferAtom)
  return {
    drawOffer,
  }
}
