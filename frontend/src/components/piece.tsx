import { useBoardDrag } from "@/hooks/use-board-drag";
import { createPortal } from "react-dom";
import { cn, pieceImgMap } from "@/lib/utils";
import { type PieceSymbol, type Square } from "chess.js";
import React from "react";
import type { LocalMove } from "@/types/chess";

type PieceProps = {
  type: PieceSymbol;
  color: "w" | "b";
  size?: 50 | 75 | 100 | 150 | 200;
  square: Square;
  onSelect: (square: Square | null) => void;
  onHover: (square: Square | null) => void;
  onMove: (move: LocalMove) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
};

export default function Piece({
  type,
  color,
  size = 150,
  square,
  boardRef,
  onSelect,
  onHover,
  onMove,
}: PieceProps) {
  const ref = React.useRef<HTMLImageElement | null>(null);
  const src = pieceImgMap[type][color].replace("/150/", `/${size}/`);

  const { isDragging, coordinates, dragSize } = useBoardDrag({
    pieceRef: ref,
    boardRef,
    reversed: false,
    square,
    onMove,
    onHover,
  });

  React.useEffect(() => {
    if (isDragging) onSelect(square);
  }, [isDragging]);

  const img = (
    <img
      src={src}
      draggable={false}
      className={cn(
        isDragging
          ? "fixed -translate-1/2 size-11/12 z-20"
          : "size-11/12 relative",
      )}
      onClick={() => onSelect(square)}
      style={{
        left: coordinates ? coordinates.x + "px" : "",
        top: coordinates ? coordinates.y + "px" : "",
        maxWidth: dragSize || "100%",
        maxHeight: dragSize || "100%",
      }}
      ref={ref}
    />
  );

  if (isDragging && coordinates) {
    return createPortal(img, document.body);
  }

  return img;
}
