export type MoveQuality =
  | "brilliant" // !!
  | "great" // !
  | "best" // Meilleur coup
  | "excellent"
  | "good"
  | "book" // Coup théorique
  | "inaccuracy" // ?!
  | "mistake" // ?
  | "blunder" // ??
  | "missed-win"; // Victoire manquée

export type BetterGameTree = {
  move: string | null;
  bestMoves?: string[];
  moveQuality?: MoveQuality | null;
  evaluation?: { cp?: number | null; mate?: number | null };
  nextVariation: BetterGameTree[];
  isMain: boolean;
};
export type EvalOutput = {
  move: string | null;
  bestMoves: string[];
  evaluation: { cp?: number | null; mate?: number | null };
  nextVariations: string[][];
};
