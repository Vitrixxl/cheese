import {
  boardVersionAtom,
  chessAtom,
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
} from "@/store/chess-board";
import type { LocalMove } from "@/types/chess";
import type { Chess, Move, Square } from "chess.js";
import { useAtomValue, useSetAtom } from "jotai";

export type BoardController = {
  chess: Chess;
  selectSquare(square: Square | null): void;
  setHover(square: Square | null): void;
  availableMoves: Move[];
  applyLocalMove(move: LocalMove): boolean;
  loadFen(fen: string): boolean;
  reset(): void;
};

export function useBoardController(): BoardController {
  const chess = useAtomValue(chessAtom);
  const setSelected = useSetAtom(selectedSquareAtom);
  const setVersion = useSetAtom(boardVersionAtom);
  const setMoves = useSetAtom(hintMovesAtom);
  const setHover = useSetAtom(hoverSquareAtom);

  const selectSquare = (square: Square | null) => {
    setSelected(square);
    if (!square) {
      setMoves([]);
      return;
    }
    const moves = chess.moves({ square, verbose: true }) as Move[];
    setMoves(moves);
  };

  const bumpBoard = () => setVersion((v) => v + 1);

  const applyLocalMove = (move: LocalMove) => {
    chess.move(move);
    bumpBoard();
    setSelected(null);
    setMoves([]);
    setHover(null);
    return true;
  };

  const loadFen = (fen: string) => {
    chess.load(fen);
    bumpBoard();
    setSelected(null);
    setMoves([]);
    setHover(null);
    return true;
  };

  const reset = () => {
    chess.reset();
    bumpBoard();
    setSelected(null);
    setMoves([]);
    setHover(null);
  };

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
  };
}
