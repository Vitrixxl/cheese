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

export type GameTreeMove = {
  move: string;
  bestMoves?: string[];
  moveQuality?: MoveQuality | null;
  evaluation?: { cp?: number | null; mate?: number | null };
};

export type GameTree = {
  whiteMove: GameTreeMove;
  blackMove: GameTreeMove | null;
  whiteVariations: GameTree[];
  blackVariations: GameTree[];
  index: number;
  isMain: boolean;
}[];

export type EvalOutput = {
  move: string | null;
  bestMoves: string[];
  evaluation: { cp?: number | null; mate?: number | null };
  nextVariations: string[][];
};
