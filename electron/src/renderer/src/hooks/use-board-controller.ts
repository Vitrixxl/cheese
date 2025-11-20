import { outcomeAtom } from '@/store'
import {
  boardVersionAtom,
  chessAtom,
  chessHistoryAtom,
  hintMovesAtom,
  hoverSquareAtom,
  passedMovesAtom,
  selectedSquareAtom,
  uiBoardVersionAtom,
  uiChessAtom,
  uiMovesPathKeyAtom,
} from '@/store/chess-board'
import type { LocalMove } from '@/types/chess'
import { Chess, type Move, type Square } from 'chess.js'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'

// export type BoardController = {
//   chess: Chess
//   selectSquare(square: Square | null): void
//   setHover(square: Square | null): void
//   availableMoves: Move[]
//   applyLocalMove(move: LocalMove | string): boolean
//   loadFen(fen: string): void
//   setOutcome: (params: { winner: User['id'] | null; outcome: Outcome } | null) => void
//   reset(): void
//   undo(): void
//   redo(): void
// }

export function useBoardController() {
  const chess = useAtomValue(chessAtom)
  const uiChess = useAtomValue(uiChessAtom)
  const setSelected = useSetAtom(selectedSquareAtom)
  const setUiVersion = useSetAtom(uiBoardVersionAtom)
  const setVersion = useSetAtom(boardVersionAtom)
  const setMoves = useSetAtom(hintMovesAtom)
  const setHover = useSetAtom(hoverSquareAtom)
  const setHistory = useSetAtom(chessHistoryAtom)
  const setOutcome = useSetAtom(outcomeAtom)
  const setUiMovesPathKey = useSetAtom(uiMovesPathKeyAtom)
  const [passedMoves, setPassedMoves] = useAtom(passedMovesAtom)

  const selectSquare = (square: Square | null) => {
    setSelected(square)
    if (!square) {
      setMoves([])
      return
    }
    const moves = chess.moves({ square, verbose: true }) as Move[]
    setMoves(moves)
  }

  const bumpUiBoard = () => setUiVersion((v) => v + 1)
  const bumpBoard = () => setVersion((v) => v + 1)

  const applyLocalMove = (move: LocalMove | string) => {
    chess.move(move)
    uiChess.loadPgn(chess.pgn())
    setHistory(chess.history())
    bumpBoard()
    bumpUiBoard()
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
    uiChess.load(localChess.fen())
    bumpUiBoard()
  }

  const loadFen = (fen: string) => {
    chess.load(fen)
    uiChess.load(fen)
    bumpUiBoard()
    bumpBoard()
    setSelected(null)
    setMoves([])
    setHover(null)
  }

  const loadPgn = (pgn: string) => {
    chess.loadPgn(pgn)
    uiChess.loadPgn(pgn)
    bumpUiBoard()
    bumpBoard()
    setSelected(null)
    setMoves([])
    setHover(null)
  }

  const reset = () => {
    chess.reset()
    uiChess.reset()
    bumpBoard()
    bumpUiBoard()
    setSelected(null)
    setMoves([])
    setHover(null)
  }

  const resyncUi = () => {
    uiChess.load(chess.fen())
    setUiMovesPathKey('')
    bumpUiBoard()
  }

  const undo = () => {
    const move = uiChess.undo()
    if (!move) return
    setPassedMoves((prev) => [move, ...prev])
    bumpUiBoard()
  }

  const redo = () => {
    const lastMove = passedMoves[0]
    if (!lastMove) return
    uiChess.move(lastMove)
    setPassedMoves((prev) => prev.slice(1, prev.length))
    bumpUiBoard()
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
    setUiMovesPathKey,
    resyncUi,
    loadPgn,
  }
}
