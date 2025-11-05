import type { Chess, Move, Square } from "chess.js";
import { motion as m } from "motion/react";
import Piece from "./piece";
import { cn } from "@/lib/utils";
import type { LocalMove } from "@/types/chess";
import React from "react";
import { usePieceKeys } from "@/hooks/use-piece-keys";

const fileLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rankNumbers = [8, 7, 6, 5, 4, 3, 2, 1];

export type BoardProps = {
  board: ReturnType<Chess["board"]>;
  moves: Move[];
  hover: Square | null;
  selected: Square | null;
  onSelect: (square: Square | null) => any;
  onHover: (square: Square | null) => any;
  onMove: (move: LocalMove) => any;
};

export default function Board({
  board,
  moves,
  hover,
  selected,
  onSelect,
  onHover,
  onMove,
}: BoardProps) {
  const boardRef = React.useRef<HTMLDivElement | null>(null);
  const { getUID, applyMoveToUIDs } = usePieceKeys(board);

  return (
    <div
      className="grid aspect-square max-w-full grid-cols-8 rounded-2xl border bg-gray-800 overflow-hidden max-h-full select-none"
      ref={boardRef}
      onContextMenuCapture={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {board.map((rank, rankIndex) =>
        rank.map((square, fileIndex) => {
          const squareName =
            `${fileLetters[fileIndex]}${rankNumbers[rankIndex]}` as Square;
          const isDark = (rankIndex + fileIndex) % 2 === 1;

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
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                {selected &&
                  (selected == squareName || hover == squareName) && (
                    <>
                      <div className="flex justify-between w-full">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2/6  border-t-[6px] border-background/50 aspect-square",
                              i % 2 == 0
                                ? "border-l-[6px] rounded-tl-xl"
                                : "border-r-[6px] rounded-tr-xl",
                            )}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between w-full">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2/6  border-b-[6px] border-background/50 aspect-square",
                              i % 2 == 0
                                ? "border-l-[6px] rounded-bl-xl"
                                : "border-r-[6px] rounded-br-xl",
                            )}
                          ></div>
                        ))}
                      </div>
                    </>
                  )}
              </div>
              {square && (
                <m.div
                  key={getUID(squareName, square.type, square.color)}
                  layout
                  layoutId={getUID(squareName, square.type, square.color)}
                  transition={{
                    duration: 0.08,
                    type: "keyframes",
                  }}
                  className="relative size-full items-center justify-center flex z-10"
                >
                  <Piece
                    type={square.type}
                    color={square.color}
                    key={square.square}
                    square={square.square}
                    onSelect={onSelect}
                    onHover={onHover}
                    onMove={(m) => {
                      const move = moves.find((m) => m.to == squareName)!;
                      if (!move) return;
                      applyMoveToUIDs(m);
                      onMove(m);
                    }}
                    boardRef={boardRef}
                  />
                </m.div>
              )}
              {moves.some((move) => move.to === squareName) && (
                <div
                  className="absolute inset-0 bg-transparent flex items-center justify-center z-20 p-2"
                  onClickCapture={() => {
                    const move = moves.find((m) => m.to == squareName)!;
                    applyMoveToUIDs(move);
                    onMove(move);
                  }}
                >
                  {square ? (
                    <div
                      className={cn(
                        "rounded-[18px] border-[6px] border-background/50  size-full",
                        hover == squareName && "border-[12px]",
                      )}
                    ></div>
                  ) : (
                    <div
                      className={"rounded-full bg-background/50 size-1/3 "}
                    ></div>
                  )}
                </div>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
