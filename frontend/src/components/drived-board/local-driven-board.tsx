import Board from "@/components/board";
import { useBoardDriver } from "@/hooks/use-board-driver";
import {
  boardAtom,
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
} from "@/store/chess-board";
import { useAtomValue } from "jotai";

export default function LocalDrivenBoard() {
  const { controller, playMove } = useBoardDriver({ id: "local" });
  const board = useAtomValue(boardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  const selected = useAtomValue(selectedSquareAtom);
  return (
    <Board
      board={board}
      moves={moves}
      hover={hover}
      selected={selected}
      onMove={playMove}
      onSelect={controller.selectSquare}
      onHover={controller.setHover}
    />
  );
}
