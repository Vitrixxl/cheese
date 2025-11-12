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
import BoardContainer from "../board-container";

export default function LocalDrivenBoard() {
  const { controller, playMove } = useBoardDriver({ id: "local" });
  const board = useAtomValue(uiChessBoardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  const selected = useAtomValue(selectedSquareAtom);

  return (
    <BoardContainer
      board={
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
      }
      sideBoard={<BoardHistory />}
    />
  );
}
