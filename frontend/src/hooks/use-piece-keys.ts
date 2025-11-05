// usePieceKeys.ts
import { useEffect, useRef } from "react";
import type { Chess, Color, PieceSymbol, Square } from "chess.js";
import type { LocalMove } from "@shared";

type UID = string;
type PieceAtSquare = {
  square: Square;
  type: PieceSymbol;
  color: Color;
};

export function usePieceKeys(board: ReturnType<Chess["board"]>) {
  // map case -> UID (suivi par pièce)
  const uidBySquareRef = useRef<Record<Square, UID>>(
    //@ts-ignore
    {},
  );
  // simple compteur pour générer des UIDs uniques
  const counterRef = useRef(0);

  // helper
  const makeUID = (p: PieceAtSquare) =>
    `${p.color}-${p.type}-${counterRef.current++}` as UID;

  // (ré)attribuer des UIDs pour les pièces visibles à l’écran au 1er rendu
  useEffect(() => {
    const current = uidBySquareRef.current;
    const next: Record<Square, UID> = { ...current };

    for (let r = 0; r < board.length; r++) {
      for (let f = 0; f < board[r].length; f++) {
        const sq = board[r][f];
        if (!sq) continue;
        const s = sq.square as Square;
        if (!next[s]) {
          next[s] = makeUID({
            square: s,
            type: sq.type,
            color: sq.color,
          });
        }
      }
    }

    uidBySquareRef.current = next;
    // pas de deps sur board intentionnellement : on ne veut pas regénérer à chaque tick,
    // seulement compléter les cases qui n'ont pas encore d'UID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // expose une fonction pour récupérer l'UID d'une case (si pas présent on le crée)
  const getUID = (square: Square, type: PieceSymbol, color: Color) => {
    const map = uidBySquareRef.current;
    if (!map[square]) {
      map[square] = makeUID({ square, type, color });
    }
    return map[square];
  };

  // fonction à appeler AVANT d’appliquer le coup au state parent
  const applyMoveToUIDs = (
    move: LocalMove,
    meta?: {
      isCastle?: boolean;
      isEnPassant?: boolean;
      capturedSquare?: Square;
    },
  ) => {
    const map = uidBySquareRef.current;
    const { from, to, promotion } = move;

    // base: déplacer l'UID from -> to
    const movingUID = map[from as Square];
    if (movingUID) {
      // capture (standard) : retirer l'UID de la case "to" si occupée
      if (map[to as Square]) {
        delete map[to as Square];
      }
      // en passant: retirer l'UID du pion capturé
      if (
        meta?.isEnPassant &&
        meta.capturedSquare &&
        map[meta.capturedSquare]
      ) {
        delete map[meta.capturedSquare];
      }

      // roque: déplacer la tour aussi
      if (meta?.isCastle) {
        // détecter la tour selon le sens du roque
        const fileFrom = from.charCodeAt(0);
        const fileTo = to.charCodeAt(0);
        const rank = from[1]; // même rang que le roi
        const kingSide = fileTo > fileFrom;
        const rookFrom = (kingSide ? `h${rank}` : `a${rank}`) as Square;
        const rookTo = (kingSide ? `f${rank}` : `d${rank}`) as Square;
        if (map[rookFrom]) {
          map[rookTo] = map[rookFrom];
          delete map[rookFrom];
        }
      }

      // promotion: on force un nouvel UID (nouvelle pièce)
      if (promotion) {
        map[to as Square] =
          `${movingUID}::prom-${promotion}-${counterRef.current++}`;
      } else {
        map[to as Square] = movingUID;
      }
      delete map[from as Square];
    }
  };

  return { getUID, applyMoveToUIDs, uidBySquareRef };
}
