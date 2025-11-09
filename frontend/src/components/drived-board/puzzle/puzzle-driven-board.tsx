import Board from "@/components/board";
import {
  boardAtom,
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
  uiChessBoardAtom,
} from "@/store/chess-board";
import Protected from "@/components/protected";
import { useBoardController } from "@/hooks/use-board-controller";
import { useNextPuzzle, usePuzzle } from "@/hooks/use-puzzle";
import { useAtomValue } from "jotai";
import React from "react";
import type { LocalMove } from "@/types";
import { Chess } from "chess.js";
import FinishedPuzzleDialog from "./finished-dialog-puzzle";

export default function PuzzleDrivenBoard() {
  const { data, isLoading } = usePuzzle();
  const { isLoading: isNextLoading, fetchNext } = useNextPuzzle();
  const [isOpen, setIsOpen] = React.useState(false);
  const movesRef = React.useRef<string[]>([]);
  const movesCountRef = React.useRef(1);
  const { applyLocalMove, selectSquare, setHover, loadFen, chess } =
    useBoardController();

  const board = useAtomValue(uiChessBoardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  const selected = useAtomValue(selectedSquareAtom);

  const handleMove = (m: LocalMove) => {
    const clone = new Chess(chess.fen());
    const move = clone.move(m);
    const rightMove = movesRef.current[movesCountRef.current];
    console.log(rightMove);
    if (move.lan != rightMove) {
      return;
    }

    applyLocalMove(m);
    movesCountRef.current++;
    if (movesCountRef.current == movesRef.current.length) {
      setIsOpen(true);
      return;
    }

    setTimeout(() => {
      applyLocalMove(movesRef.current[movesCountRef.current]);
      movesCountRef.current++;
    }, 200);
  };
  React.useEffect(() => {
    if (!data) return;
    loadFen(data.fen);
    const moves = data.moves.split(" ");
    applyLocalMove(moves[0]);
    movesRef.current = moves;
    movesCountRef.current = 1;
  }, [data]);

  return (
    <Protected>
      <div className="grid-rows-[auto_1fr] h-full gap-4 grid xl:grid-cols-[auto_1fr] xl:grid-rows-1">
        <Board
          loading={isLoading || isNextLoading}
          selected={selected}
          moves={moves}
          hover={hover}
          board={board}
          onSelect={selectSquare}
          onHover={setHover}
          onMove={handleMove}
          playerColor={data?.color == "w" ? "b" : "w"}
        />
      </div>
      <FinishedPuzzleDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onNext={() => {
          setIsOpen(false);
          fetchNext();
        }}
      />
    </Protected>
  );
}
