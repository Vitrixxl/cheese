import Board from "@/components/board";
import { useBoardDriver } from "@/hooks/use-board-driver";
import {
  boardAtom,
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
} from "@/store/chess-board";
import { useAtomValue } from "jotai";
import { BoardHistory } from "../board-history";

export default function LocalDrivenBoard() {
  const { controller, playMove } = useBoardDriver({ id: "local" });
  const board = useAtomValue(boardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  const selected = useAtomValue(selectedSquareAtom);
  return (
    <div className="grid grid-rows-1 h-full gap-4">
      <Board
        board={board}
        moves={moves}
        hover={hover}
        selected={selected}
        color="w"
        onMove={playMove}
        onSelect={controller.selectSquare}
        onHover={controller.setHover}
      />
      <BoardHistory />
    </div>
  );
}
