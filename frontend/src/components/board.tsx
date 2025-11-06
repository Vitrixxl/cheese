import type { Chess, Move, Square, Color } from "chess.js";
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
  color: Color;
  onSelect: (square: Square | null) => any;
  onHover: (square: Square | null) => any;
  onMove: (move: LocalMove) => any;
};

export default function Board({
  board,
  moves,
  hover,
  selected,
  color,
  onSelect,
  onHover,
  onMove,
}: BoardProps) {
  const boardRef = React.useRef<HTMLDivElement | null>(null);
  const { getUID, applyMoveToUIDs } = usePieceKeys(board);

  const files = color === "b" ? [...fileLetters].reverse() : fileLetters;
  const ranks = color === "b" ? [...rankNumbers].reverse() : rankNumbers;

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
            `${files[fileIndex]}${ranks[rankIndex]}` as Square;
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
              <div className="absolute inset-0 pointer-events-none grid grid-cols-[0.90fr_0.5fr_0.90fr] grid-rows-[0.90fr_0.5fr_0.90fr] p-2 size-full ">
                {selected &&
                  (selected == squareName || hover == squareName) && (
                    <>
                      <div className="col-start-1 row-start-1 border-t-[6px] border-l-[6px]  border-background/50 rounded-tl-xl " />
                      <div className="col-start-3 row-start-1 border-t-[6px] border-r-[6px]  border-background/50 rounded-tr-xl" />
                      <div className="col-start-1 row-start-3 border-b-[6px] border-l-[6px]  border-background/50 rounded-bl-xl " />
                      <div className="col-start-3 row-start-3 border-b-[6px] border-r-[6px]  border-background/50 rounded-br-xl " />
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
                      const move = moves.find(
                        (move) => move.to == m.to && move.from == m.from,
                      )!;
                      if (!move) return;
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
                    hover != squareName && (
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-[0.25fr_1fr_0.25fr] grid-rows-[0.25fr_1fr_0.25fr] p-2 size-full ">
                        <div className="col-start-1 row-start-1 border-t-[6px] border-l-[6px]  border-background/50 rounded-tl-xl " />
                        <div className="col-start-3 row-start-1 border-t-[6px] border-r-[6px]  border-background/50 rounded-tr-xl" />
                        <div className="col-start-1 row-start-3 border-b-[6px] border-l-[6px]  border-background/50 rounded-bl-xl " />
                        <div className="col-start-3 row-start-3 border-b-[6px] border-r-[6px]  border-background/50 rounded-br-xl " />
                      </div>
                    )
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
