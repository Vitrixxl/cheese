import type { Position } from "@/components/window";
import type { Square } from "chess.js";
import React from "react";
import type { LocalMove } from "@/types/chess";

type UseBoardDragParams = {
  pieceRef: React.RefObject<HTMLDivElement | null>;
  boardRef: React.RefObject<HTMLDivElement | null>;
  square: Square;
  reversed: boolean;
  onMove: (move: LocalMove) => void;
  onHover: (square: Square | null) => void;
};

const fileLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rankNumbers = [8, 7, 6, 5, 4, 3, 2, 1];
export const useBoardDrag = ({
  pieceRef,
  reversed,
  square,
  boardRef,
  onMove,
  onHover,
}: UseBoardDragParams) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [coordinates, setCoordinates] = React.useState<Position | null>(null);
  const [dragSize, setDragSize] = React.useState<string | null>(null);
  const hoverRef = React.useRef<Square | null>(null);

  const resizePiece = () => {
    if (!pieceRef.current) return;
    const newSize = pieceRef.current.getBoundingClientRect().width * 1.3 + "px";
    setDragSize(newSize);
  };
  const resetSize = () => {
    setDragSize(null);
  };

  const handlePieceMouseDown = (e: MouseEvent) => {
    if (e.button == 0) {
      resizePiece();
      handleMouseMove(e);
      setIsDragging(true);
    }
  };

  const handleMouseUp = React.useEffectEvent(() => {
    onHover(null);
    setCoordinates(null);
    setIsDragging(false);
    if (hoverRef.current) {
      onMove({
        from: square,
        to: hoverRef.current,
      });
    }
  });

  const isInBound = (container: HTMLElement, position: Position) => {
    const bounds = container.getBoundingClientRect();
    return (
      bounds.left <= position.x &&
      bounds.top <= position.y &&
      bounds.top + bounds.height >= position.y &&
      bounds.left + bounds.width >= position.x
    );
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (
      !pieceRef.current ||
      !boardRef.current ||
      !isInBound(boardRef.current, { x: e.x, y: e.y })
    ) {
      // setIsDragging(false);
      // setCoordinates(null);
      // resetSize();
      return;
    }

    const bounds = boardRef.current.getBoundingClientRect();
    const squareWidth = bounds.width / 8;
    const squareHeight = bounds.height / 8;

    const relX = Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width);
    const relY = Math.min(Math.max(e.clientY - bounds.top, 0), bounds.height);

    const file = Math.floor(relX / squareWidth);
    const rank = Math.floor(relY / squareHeight);

    const fileIndex = reversed ? 7 - file : file;
    const rankIndex = reversed ? 7 - rank : rank;
    hoverRef.current =
      `${fileLetters[fileIndex]}${rankNumbers[rankIndex]}` as Square;
    onHover(hoverRef.current);

    setCoordinates({
      x: e.x,
      y: e.y,
    });
  };

  React.useEffect(() => {
    if (!boardRef.current || !pieceRef.current) return;
    pieceRef.current.addEventListener("mousedown", handlePieceMouseDown);
  }, [pieceRef, boardRef]);

  React.useEffect(() => {
    if (isDragging && pieceRef.current && boardRef.current) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        resetSize();
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
    if (!pieceRef.current) return;
    pieceRef.current.addEventListener("mousedown", handlePieceMouseDown);
  }, [isDragging]);

  return { isDragging, coordinates, dragSize };
};
