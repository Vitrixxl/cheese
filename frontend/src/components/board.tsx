import type { Chess, Move, Square, Color } from "chess.js";
import Piece from "./piece";
import { cn } from "@/lib/utils";
import type { LocalMove } from "@/types/chess";
import React from "react";
import Promotion from "./promotion";
import { useAtomValue } from "jotai";
import { turnAtom } from "@/store";
import { GameOutcomeDialog } from "./drived-board/game-outcome";

const fileLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rankNumbers = [8, 7, 6, 5, 4, 3, 2, 1];

const Crosshair = ({
  variant = "selected",
  hasSquare,
}: {
  variant?: "selected" | "move";
  hasSquare?: boolean;
}) => (
  <div
    className={cn(
      "absolute pointer-events-none grid size-full",
      variant === "selected"
        ? "grid-cols-[0.90fr_0.5fr_0.90fr] grid-rows-[0.90fr_0.5fr_0.90fr] p-2 inset-0 "
        : cn(
            "grid-cols-[0.25fr_1fr_0.25fr] grid-rows-[0.25fr_1fr_0.25fr]",
            hasSquare
              ? "p-2 inset-0"
              : "top-1/2 left-1/2 -translate-1/2 size-2/4 grid-cols-[1fr_1fr_1fr] grid-rows-[1fr_1fr_1fr]",
          ),
    )}
  >
    <div className="col-start-1 row-start-1 border-t-[6px] border-l-[6px] border-background/50 rounded-tl-xl" />
    <div className="col-start-3 row-start-1 border-t-[6px] border-r-[6px] border-background/50 rounded-tr-xl" />
    <div className="col-start-1 row-start-3 border-b-[6px] border-l-[6px] border-background/50 rounded-bl-xl" />
    <div className="col-start-3 row-start-3 border-b-[6px] border-r-[6px] border-background/50 rounded-br-xl" />
  </div>
);

export type BoardProps = {
  board: ReturnType<Chess["board"]>;
  moves: Move[];
  hover: Square | null;
  selected: Square | null;
  playerColor: Color | null;
  onSelect: (square: Square | null) => any;
  onHover: (square: Square | null) => any;
  onMove: (move: LocalMove) => any;
};

export default function Board({
  board,
  moves,
  hover,
  selected,
  playerColor,
  onSelect,
  onHover,
  onMove,
}: BoardProps) {
  const boardRef = React.useRef<HTMLDivElement | null>(null);
  const [needPromotion, setNeedPromotion] = React.useState<
    (LocalMove & { color: Color }) | null
  >(null);

  const turn = useAtomValue(turnAtom);

  const files = playerColor === "b" ? [...fileLetters].reverse() : fileLetters;
  const ranks = playerColor === "b" ? [...rankNumbers].reverse() : rankNumbers;
  const displayBoard =
    playerColor === "b"
      ? board.map((rank) => [...rank].reverse()).reverse()
      : board;

  return (
    <div
      className="grid aspect-square  grid-cols-8 grid-rows-8 rounded-2xl border bg-gray-800 overflow-hidden select-none relative max-h-full max-w-full "
      ref={boardRef}
      onContextMenuCapture={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {displayBoard.map((rank, rankIndex) =>
        rank.map((square, fileIndex) => {
          const squareName = `${files[fileIndex]}${ranks[rankIndex]}` as Square;
          let isDark = (rankIndex + fileIndex) % 2 === 1;

          const isSelected =
            selected && (selected === squareName || hover === squareName);
          const isAvailableMove =
            moves.some((move) => move.to === squareName) &&
            hover !== squareName;
          const showCrosshair = isSelected || isAvailableMove;
          const crosshairVariant = isSelected ? "selected" : "move";

          return (
            <div
              key={squareName}
              data-square={squareName}
              className={cn(
                "aspect-square flex items-center justify-center shadow-lg relative",
                isDark ? "bg-black-square" : "bg-white-square",
                hover && hover == square?.square && "shadow-inner",
              )}
              onClick={() => !square && onSelect(null)}
            >
              {showCrosshair && (
                <Crosshair variant={crosshairVariant} hasSquare={!!square} />
              )}
              {moves.some((move) => move.to === squareName) && (
                <div
                  className="absolute inset-0 bg-transparent flex items-center justify-center z-20 p-2"
                  onClickCapture={() => {
                    const move = moves.find((m) => m.to == squareName)!;
                    if (move.isPromotion()) {
                      setNeedPromotion({ ...move, color: turn });
                      return;
                    }
                    onMove(move);
                  }}
                />
              )}
              <Promotion
                needPromotion={needPromotion}
                setNeedPromotion={setNeedPromotion}
                onMove={onMove}
                boardRef={boardRef}
                squareName={squareName}
                rankIndex={rankIndex}
                ranks={ranks}
              />
            </div>
          );
        }),
      )}
      {displayBoard.map((rank, rankIndex) =>
        rank.map((square, fileIndex) => {
          if (!square) return;
          const realSquare =
            (square as any).square ??
            (`${fileLetters[fileIndex]}${rankNumbers[rankIndex]}` as Square);

          return (
            <Piece
              key={realSquare}
              color={square.color}
              square={square.square}
              playerColor={playerColor}
              type={square.type}
              top={`calc((100% * ${rankIndex} / 8) + 1.25%)`}
              left={`calc((100% * ${fileIndex} / 8) + 1.25%)`}
              boardRef={boardRef}
              onHover={onHover}
              onMove={(m) => {
                const move = moves.find(
                  (move) => move.to == m.to && move.from == m.from,
                )!;
                if (!move) return;
                if (move.isPromotion()) {
                  setNeedPromotion({ ...m, color: square.color });
                  return;
                }
                onMove(m);
              }}
              onSelect={onSelect}
            />
          );
        }),
      )}
    </div>
  );
}
