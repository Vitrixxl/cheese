import type { GameTree } from '@shared'
import { naturalToUci } from './utils'

export const analyseMoves = async (moves: string[]): Promise<GameTree> => {
  return await window.api.stockfish.evalGame(naturalToUci(moves))
}
