import { analyseMoves } from '@/lib/stockfish'
import type { GameTree } from '@shared'
import { useState } from 'react'

export const useAnalyseMoves = () => {
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [gameTree, setGameTree] = useState<GameTree>([])

  const analyse = async (moves: string[]) => {
    setIsAnalysing(true)
    const gameTree = await analyseMoves(moves)
    setGameTree(gameTree)
    setIsAnalysing(false)
  }

  return {
    isAnalysing,
    gameTree,
    analyse,
  }
}
