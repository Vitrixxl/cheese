import { useBoardDrag } from "@/hooks/use-board-drag";
import { createPortal } from "react-dom";
import { cn, pieceImgMap } from "@/lib/utils";
import { type PieceSymbol, type Square, type Color } from "chess.js";
import React from "react";
import type { LocalMove } from "@/types/chess";

type PieceProps = {
  type: PieceSymbol;
  color: Color;
  size?: 50 | 75 | 100 | 150 | 200;
  square: Square;
  playerColor: Color;
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
  playerColor,
  onSelect,
  onHover,
  onMove,
}: PieceProps) {
  const ref = React.useRef<HTMLImageElement | null>(null);
  const src = pieceImgMap[type][color].replace("/150/", `/${size}/`);

  const { isDragging, coordinates, dragSize } = useBoardDrag({
    pieceRef: ref,
    boardRef,
    color,
    playerColor,
    square,
    onMove,
    onHover,
  });

  React.useEffect(() => {
    if (isDragging && playerColor == color) onSelect(square);
  }, [isDragging]);

  const img = (
    <img
      src={src}
      draggable={false}
      className={cn(
        isDragging ? "fixed -translate-1/2 z-20" : "h-10/12 relative",
      )}
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
