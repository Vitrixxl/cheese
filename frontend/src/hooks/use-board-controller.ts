import { outcomeAtom } from "@/store";
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
} from "@/store/chess-board";
import type { LocalMove } from "@/types/chess";
import type { Outcome, User } from "@shared";
import type { Chess, Move, Square } from "chess.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

export type BoardController = {
  chess: Chess;
  selectSquare(square: Square | null): void;
  setHover(square: Square | null): void;
  availableMoves: Move[];
  applyLocalMove(move: LocalMove): boolean;
  loadFen(fen: string): boolean;
  setOutcome: (
    params: { winner: User["id"] | null; outcome: Outcome } | null,
  ) => void;
  reset(): void;
  undo(): void;
  redo(): void;
};

export function useBoardController(): BoardController {
  const chess = useAtomValue(chessAtom);
  const uiChess = useAtomValue(uiChessAtom);
  const setSelected = useSetAtom(selectedSquareAtom);
  const setUiVersion = useSetAtom(uiBoardVersionAtom);
  const setVersion = useSetAtom(boardVersionAtom);
  const setMoves = useSetAtom(hintMovesAtom);
  const setHover = useSetAtom(hoverSquareAtom);
  const setHistory = useSetAtom(chessHistoryAtom);
  const setOutcome = useSetAtom(outcomeAtom);
  const [passedMoves, setPassedMoves] = useAtom(passedMovesAtom);

  const selectSquare = (square: Square | null) => {
    setSelected(square);
    if (!square) {
      setMoves([]);
      return;
    }
    const moves = chess.moves({ square, verbose: true }) as Move[];
    setMoves(moves);
  };

  const bumpUiBoard = () => setUiVersion((v) => v + 1);
  const bumpBoard = () => setVersion((v) => v + 1);

  const applyLocalMove = (move: LocalMove) => {
    chess.move(move);
    uiChess.loadPgn(chess.pgn());
    setHistory(chess.history());
    bumpBoard();
    bumpUiBoard();
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

  const undo = () => {
    const move = uiChess.undo();
    if (!move) return;
    setPassedMoves((prev) => [move, ...prev]);
    bumpUiBoard();
  };

  const redo = () => {
    const lastMove = passedMoves[0];
    if (!lastMove) return;
    uiChess.move(lastMove);
    setPassedMoves((prev) => prev.slice(1, prev.length));
    bumpUiBoard();
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
    redo,
    undo,
    setOutcome,
  };
}
