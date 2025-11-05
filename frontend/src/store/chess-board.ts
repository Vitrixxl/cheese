import type { DriverType } from "@/types";
import { Chess, type Move, type Square } from "chess.js";
import { atom } from "jotai";

export const currentBoardDriver = atom<DriverType>("local");

/**
 * Only use with useAtomValue
 * No need to change it, it will be reset by the useChessBoard()
 */
export const chessAtom = atom(new Chess());

/**
 * Use purely for dx, it will trigger a rerender on the board atom
 */
export const boardVersionAtom = atom<number>(0);
export const boardAtom = atom<ReturnType<Chess["board"]>>((get) => {
  get(boardVersionAtom);
  return get(chessAtom).board();
});

export const selectedSquareAtom = atom<Square | null>(null);

export const hintMovesAtom = atom<Move[]>([]);

export const hoverSquareAtom = atom<Square | null>(null);
