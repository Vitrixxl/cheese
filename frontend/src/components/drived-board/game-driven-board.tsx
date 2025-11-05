import Board from "@/components/board";
import { useBoardDriver } from "@/hooks/use-board-driver";
import { boardAtom, hintMovesAtom, hoverSquareAtom } from "@/store/chess-board";
import { useAtomValue } from "jotai";

export default function GameDrivenBoard() {
  const { controller, playMove } = useBoardDriver({
    id: "local",
    /**
     * Need to add a socket transmission
     */
    onLocalMove: (move, ctx) => {
      return true;
    },
    start: ({ applyLocalMove }) => {},
  });
  const board = useAtomValue(boardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  return (
    <Board
      board={board}
      moves={moves}
      hover={hover}
      onMove={playMove}
      onSelect={controller.selectSquare}
      onHover={controller.setHover}
    />
  );
}
