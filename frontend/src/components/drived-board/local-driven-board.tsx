import Board from "@/components/board";
import { useBoardDriver } from "@/hooks/use-board-driver";
import {
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
  uiChessBoardAtom,
} from "@/store/chess-board";
import { useAtomValue } from "jotai";
import { BoardHistory } from "../board-history";

export default function LocalDrivenBoard() {
  const { controller, playMove } = useBoardDriver({ id: "local" });
  const board = useAtomValue(uiChessBoardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  const selected = useAtomValue(selectedSquareAtom);
  return (
    <div className="grid-rows-[auto_1fr] h-full gap-4 grid xl:grid-cols-[auto_1fr] xl:grid-rows-1">
      <Board
        board={board}
        moves={moves}
        hover={hover}
        selected={selected}
        playerColor={null}
        onMove={playMove}
        onSelect={controller.selectSquare}
        onHover={controller.setHover}
      />
      <div className="w-full h-fit justify-self-start">
        <BoardHistory />
      </div>
    </div>
  );
}
