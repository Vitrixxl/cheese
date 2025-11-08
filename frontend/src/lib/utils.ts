import type { PieceSymbol } from "chess.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const pieceNames: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

const buildPieceImgSrc = (color: "w" | "b", type: PieceSymbol) =>
  `/${color}${type.toUpperCase()}.svg`;

export const pieceImgMap: Record<PieceSymbol, { w: string; b: string }> = {
  p: {
    w: buildPieceImgSrc("w", "p"),
    b: buildPieceImgSrc("b", "p"),
  },
  n: {
    w: buildPieceImgSrc("w", "n"),
    b: buildPieceImgSrc("b", "n"),
  },
  b: {
    w: buildPieceImgSrc("w", "b"),
    b: buildPieceImgSrc("b", "b"),
  },
  r: {
    w: buildPieceImgSrc("w", "r"),
    b: buildPieceImgSrc("b", "r"),
  },
  q: {
    w: buildPieceImgSrc("w", "q"),
    b: buildPieceImgSrc("b", "q"),
  },
  k: {
    w: buildPieceImgSrc("w", "k"),
    b: buildPieceImgSrc("b", "k"),
  },
};

export const capitalize = (str: string) => {
  return `${str[0].toUpperCase()}${str.slice(1, str.length)}`;
};

export const parseTimer = () => {};
