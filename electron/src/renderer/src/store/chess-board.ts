import { Chessinator, type Piece } from '@/lib/chessinator'
import type { DriverType } from '@/types'
import type { GameTree } from '@shared'
import { Chess, type Color, type Move, type Square } from 'chess.js'
import { atom } from 'jotai'

export const currentBoardDriverAtom = atom<DriverType>('local')

/**
 * Only use with useAtomValue
 * No need to change it, it will be reset by the useChessBoard()
 */
const chess = new Chessinator()
chess.reset()
export const chessAtom = atom(chess)

/**
 * This is the one that's gonna be used to render the board
 * We need another one in order to travel into the game history
 */

export const gameTreeAtom = atom<GameTree>([])
export const piecesAtom = atom<Piece[]>((get) => {
  get(boardVersionAtom)
  return get(chessAtom).getPieces()
})

/**
 * Use purely for dx, it will trigger a rerender on the board atom
 */
export const boardVersionAtom = atom<number>(0)
export const boardAtom = atom<ReturnType<Chess['board']>>((get) => {
  get(boardVersionAtom)
  return get(chessAtom).board()
})
export const turnAtom = atom<Color>((get) => {
  get(boardVersionAtom)
  return get(chessAtom).turn()
})

export const selectedSquareAtom = atom<Square | null>(null)

export const hintMovesAtom = atom<Move[]>([])

export const hoverSquareAtom = atom<Square | null>(null)

export const chessHistoryAtom = atom<string[]>([])
export const chessHistoryTree = atom<string[][]>([])
