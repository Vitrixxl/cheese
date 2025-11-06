import Board from "@/components/board";
import { useBoardDriver } from "@/hooks/use-board-driver";
import { colorAtom } from "@/store";
import {
  boardAtom,
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
} from "@/store/chess-board";
import { gameWsAtom } from "@/store/ws";
import type { ChessClientMessage } from "@game-server/types/schema";
import { useAtomValue } from "jotai";

export default function GameDrivenBoard() {
  const ws = useAtomValue(gameWsAtom);
  const color = useAtomValue(colorAtom);
  const { controller, playMove } = useBoardDriver({
    id: "local",
    /**
     * Need to add a socket transmission
     */
    onLocalMove: (move) => {
      if (!ws) return;
      ws.send({
        key: "move",
        payload: {
          move,
        },
      } satisfies ChessClientMessage);
      return true;
    },
  });

  const board = useAtomValue(boardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  const selected = useAtomValue(selectedSquareAtom);
  if (!ws) return;
  return (
    <Board
      board={board}
      moves={moves}
      hover={hover}
      selected={selected}
      color={color || "w"}
      onMove={playMove}
      onSelect={controller.selectSquare}
      onHover={controller.setHover}
    />
  );
}
