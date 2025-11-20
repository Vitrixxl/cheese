import { outcomeAtom } from '@/store'
import {
  boardVersionAtom,
  chessAtom,
  chessHistoryAtom,
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
} from '@/store/chess-board'
import type { LocalMove } from '@/types/chess'
import { Chess, type Move, type Square } from 'chess.js'
import { useAtomValue, useSetAtom } from 'jotai'

export function useBoardController() {
  const chess = useAtomValue(chessAtom)
  const setSelected = useSetAtom(selectedSquareAtom)
  const setVersion = useSetAtom(boardVersionAtom)
  const setMoves = useSetAtom(hintMovesAtom)
  const setHover = useSetAtom(hoverSquareAtom)
  const setHistory = useSetAtom(chessHistoryAtom)
  const setOutcome = useSetAtom(outcomeAtom)

  const selectSquare = (square: Square | null) => {
    setSelected(square)
    if (!square) {
      setMoves([])
      return
    }
    const moves = chess.moves({ square, verbose: true }) as Move[]
    setMoves(moves)
  }

  const bumpBoard = () => setVersion((v) => v + 1)

  const applyLocalMove = (move: LocalMove | string) => {
    chess.applyMove(move)
    setHistory(chess.history())
    bumpBoard()
    setSelected(null)
    setMoves([])
    setHover(null)
    return true
  }

  const setMovesPath = (moves: string[]) => {
    const localChess = new Chess()
    for (const move of moves) {
      localChess.move(move)
    }
  }

  const loadFen = (fen: string) => {
    chess.load(fen)
    bumpBoard()
    setSelected(null)
    setMoves([])
    setHover(null)
  }

  const loadPgn = (pgn: string) => {
    chess.loadPgn(pgn)
    bumpBoard()
    setSelected(null)
    setMoves([])
    setHover(null)
  }

  const reset = () => {
    chess.reset()
    bumpBoard()
    setSelected(null)
    setMoves([])
    setHover(null)
  }

  const undo = () => {
    chess.undo()
    bumpBoard()
  }
  const redo = () => {
    chess.redo()
  }

  return {
    chess,
    selectSquare,
    setHover,
    availableMoves: chess.moves({
      verbose: true,
    }),
    applyLocalMove,
    loadFen,
    reset,
    redo,
    undo,
    setOutcome,
    setMovesPath,
    loadPgn,
  }
}
