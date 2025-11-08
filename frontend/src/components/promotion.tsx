import { createPortal } from "react-dom";
import { pieceImgMap } from "@/lib/utils";
import type { Color, PieceSymbol, Square } from "chess.js";
import type { LocalMove } from "@/types/chess";
import React from "react";

const PROMOTION_PIECES: PieceSymbol[] = ["n", "b", "r", "q"];

type PromotionProps = {
  needPromotion: (LocalMove & { color: Color }) | null;
  setNeedPromotion: (value: (LocalMove & { color: Color }) | null) => void;
  onMove: (move: LocalMove) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
  squareName: Square;
  rankIndex: number;
  ranks: number[];
};

export default function Promotion({
  needPromotion,
  setNeedPromotion,
  onMove,
  boardRef,
  squareName,
  rankIndex,
  ranks,
}: PromotionProps) {
  if (!needPromotion || needPromotion.to !== squareName) return null;
  if (ranks[rankIndex] !== 8 && ranks[rankIndex] !== 1) return null;

  const squareEl = boardRef.current?.querySelector(
    `[data-square="${squareName}"]`,
  ) as HTMLElement | null;
  if (!squareEl) return null;

  const rect = squareEl.getBoundingClientRect();
  const isTopRank = ranks[rankIndex] === 8;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => {
        e.stopPropagation();
        setNeedPromotion(null);
      }}
    >
      <div
        className="absolute bg-sidebar rounded-2xl p-4 shadow-2xl border flex flex-col gap-2"
        style={{
          left: rect.left - 6,
          top: isTopRank ? rect.bottom : rect.top - rect.height * 4,
          width: rect.width + 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {PROMOTION_PIECES.map((p) => (
          <button
            key={p}
            onClick={() => {
              onMove({ ...needPromotion, promotion: p });
              setNeedPromotion(null);
            }}
            className="aspect-square hover:bg-muted transition-colors p-2 rounded-xl border border-transparent hover:border-border"
          >
            <img
              src={pieceImgMap[p][needPromotion.color]}
              alt={p}
              className="w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
