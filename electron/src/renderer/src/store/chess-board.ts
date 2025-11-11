import type { Board, DriverType } from "@/types";
import { Chess, type Color, type Move, type Square } from "chess.js";
import { atom } from "jotai";

export const currentBoardDriverAtom = atom<DriverType>("local");

/**
 * Only use with useAtomValue
 * No need to change it, it will be reset by the useChessBoard()
 */
export const chessAtom = atom(new Chess());

export const uiChessAtom = atom(new Chess());

/**
 * This is the one that's gonna be used to render the board
 * We need another one in order to travel into the game history
 */
export const uiChessBoardAtom = atom<Board>((get) => {
  get(uiBoardVersionAtom);
  return get(uiChessAtom).board();
});

export const historyIndexAtom = atom<number>((get) => {
  get(uiBoardVersionAtom);
  return get(uiChessAtom).history().length;
});
export const passedMovesAtom = atom<Move[]>([]);

/**
 * Use purely for dx, it will trigger a rerender on the board atom
 */
export const boardVersionAtom = atom<number>(0);
export const uiBoardVersionAtom = atom<number>(0);
export const boardAtom = atom<ReturnType<Chess["board"]>>((get) => {
  get(boardVersionAtom);
  return get(chessAtom).board();
});
export const turnAtom = atom<Color>((get) => {
  get(boardVersionAtom);
  return get(chessAtom).turn();
});

export const selectedSquareAtom = atom<Square | null>(null);

export const hintMovesAtom = atom<Move[]>([]);

export const hoverSquareAtom = atom<Square | null>(null);

export const chessHistoryAtom = atom<string[]>([]);
