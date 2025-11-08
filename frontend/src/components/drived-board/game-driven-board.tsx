import Board from "@/components/board";
import { useBoardDriver } from "@/hooks/use-board-driver";
import { colorAtom, initialTimerAtom, playersAtom } from "@/store";
import {
  boardAtom,
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
  uiChessBoardAtom,
} from "@/store/chess-board";
import { gameWsAtom } from "@/store/ws";
import type { ChessClientMessage } from "@game-server/types/schema";
import { useAtomValue } from "jotai";
import Timer from "../timer";
import { BoardHistory } from "../board-history";
import type { LocalMove } from "@/types";
import { useBoardController } from "@/hooks/use-board-controller";
import Protected from "../protected";
import EndGameDialog from "./game/end-game-dialog";

export default function GameDrivenBoard() {
  const ws = useAtomValue(gameWsAtom);
  const color = useAtomValue(colorAtom);
  const initialTimer = useAtomValue(initialTimerAtom);
  const players = useAtomValue(playersAtom);
  const { applyLocalMove, selectSquare, setHover } = useBoardController();

  const board = useAtomValue(uiChessBoardAtom);
  const moves = useAtomValue(hintMovesAtom);
  const hover = useAtomValue(hoverSquareAtom);
  const selected = useAtomValue(selectedSquareAtom);
  const handleMove = (move: LocalMove) => {
    if (!ws) return;
    ws.send({
      key: "move",
      payload: {
        move,
      },
    } satisfies ChessClientMessage);
    applyLocalMove(move);
  };
  if (!ws || players.length != 2) return;
  return (
    <Protected>
      <div className="grid-rows-[auto_1fr] h-full gap-4 grid xl:grid-cols-[auto_1fr] xl:grid-rows-1">
        <div className="grid-rows-[0fr_auto_0fr] gap-4 grid max-h-full h-fit">
          <div className="flex justify-between w-full">
            <Timer
              initialTimer={initialTimer}
              color={color == "w" ? "b" : "w"}
            />
          </div>

          <Board
            board={board}
            moves={moves}
            hover={hover}
            selected={selected}
            playerColor={color || "w"}
            onMove={handleMove}
            onSelect={selectSquare}
            onHover={setHover}
          />
          <Timer initialTimer={initialTimer} color={color == "w" ? "w" : "b"} />
        </div>
        <div className="w-full h-fit justify-self-start">
          <BoardHistory />
        </div>
        <EndGameDialog />
      </div>
    </Protected>
  );
}
