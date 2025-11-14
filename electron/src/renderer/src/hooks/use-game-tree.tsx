import type { EvalScore } from '@shared/analysis/types'
import React from 'react'
export type GameTree = {
  move: string
  eval?: {
    bestMove: string
    evalScore: EvalScore
  }
  isMain: boolean
  variations: GameTree[]
}

const buildGameTree = (moves: string[], index = 0): GameTree => {
  if (moves.length - 1 < index) return { move: '', variations: [], isMain: true }
  const tree = {
    move: moves[index],
    variations: [buildGameTree(moves, index + 1)].filter(Boolean),
    isMain: true
  } as GameTree

  return tree
}

export const useGameTree = (moves: string[]) => {
  const [analysing, setAnalysing] = React.useState(false)

  const [gameTree, setGameTree] = React.useState(buildGameTree(moves, 0))

  React.useEffect(() => {
    setGameTree(buildGameTree(moves, 0))
  }, [moves])

  const analyse = async () => {
    setAnalysing(true)
    const analysedTree = await window.api.stockfish.evalMovesChill(moves)
    setAnalysing(false)
    setGameTree(analysedTree)
  }

  return {
    analysing,
    gameTree,
    analyse
  }
}
