import type { LocalMove } from "@/types/chess";
import type { Move, PieceSymbol } from "chess.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buildPieceImgSrc = (
  set: string,
  size: number,
  color: "w" | "b",
  type: PieceSymbol,
) =>
  `https://images.chesscomfiles.com/chess-themes/pieces/${set}/${size}/${color}${type}.png`;

const PIECE_SET = "neo";
export const pieceImgMap: Record<PieceSymbol, { w: string; b: string }> = {
  p: {
    w: buildPieceImgSrc(PIECE_SET, 150, "w", "p"),
    b: buildPieceImgSrc(PIECE_SET, 150, "b", "p"),
  },
  n: {
    w: buildPieceImgSrc(PIECE_SET, 150, "w", "n"),
    b: buildPieceImgSrc(PIECE_SET, 150, "b", "n"),
  },
  b: {
    w: buildPieceImgSrc(PIECE_SET, 150, "w", "b"),
    b: buildPieceImgSrc(PIECE_SET, 150, "b", "b"),
  },
  r: {
    w: buildPieceImgSrc(PIECE_SET, 150, "w", "r"),
    b: buildPieceImgSrc(PIECE_SET, 150, "b", "r"),
  },
  q: {
    w: buildPieceImgSrc(PIECE_SET, 150, "w", "q"),
    b: buildPieceImgSrc(PIECE_SET, 150, "b", "q"),
  },
  k: {
    w: buildPieceImgSrc(PIECE_SET, 150, "w", "k"),
    b: buildPieceImgSrc(PIECE_SET, 150, "b", "k"),
  },
};

export const toChessMove = (move: LocalMove): Move => {
  return {
    ...move,
  };
};
