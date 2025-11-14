export type Color = "white" | "black";

export type EvalScore =
  | { type: "cp"; value: number }
  | { type: "mate"; value: number };

export type EvalOutput = {
  bestMove: string;
  evalScore: EvalScore;
};

export type GameTree = {
  // Only null when it's root
  move: string | null;
  color: Color | null;
  eval?: EvalOutput;
  // branches[0] is always the main line
  // branches[1+] are alternative variations
  branches: GameTree[];
};

export type MovePairMove = {
  move: string;
  color: Color;
  eval?: EvalOutput;
};

export type MovePair = {
  index: number;
  whiteMove: MovePairMove;
  whiteBranches: MovePair[][]; // Array of variation lines
  blackMove?: MovePairMove; // Optional if no black response
  blackBranches: MovePair[][]; // Array of variation lines
};

/**
 * Transforms a GameTree into a flat array of MovePairs for display
 */
export function transformToMovePairs(
  tree: GameTree,
  startIndex: number = 1,
): MovePair[] {
  debugger;
  const pairs: MovePair[] = [];
  let currentNode = tree;
  let currentIndex = startIndex;

  while (currentNode.branches.length > 0) {
    const mainLine = currentNode.branches[0]; // Main line
    const alternativeBranches = currentNode.branches.slice(1); // Variations
    console.log({ currentNode });

    if (mainLine.color === "white") {
      // Find the corresponding black move
      const blackMainLine =
        mainLine.branches.length > 0 ? mainLine.branches[0] : null;
      const blackAlternatives = mainLine.branches.slice(1);

      const pair: MovePair = {
        index: currentIndex,
        whiteMove: {
          move: mainLine.move!,
          color: "white",
          eval: mainLine.eval,
        },
        whiteBranches: alternativeBranches.map((branch) =>
          transformToMovePairs(branch, currentIndex),
        ),
        blackMove: blackMainLine
          ? {
              move: blackMainLine.move!,
              color: "black",
              eval: blackMainLine.eval,
            }
          : undefined,
        blackBranches: blackAlternatives.map((branch) =>
          transformToMovePairs(branch, currentIndex + 1),
        ),
      };

      pairs.push(pair);

      // Continue with black's main line or white's next move
      currentNode = blackMainLine || { move: null, color: null, branches: [] };
      currentIndex++;
    } else if (mainLine.color === "black") {
      // If we start with a black move (shouldn't happen in normal cases)
      // We handle it by creating a pair with no white move
      const pair: MovePair = {
        index: currentIndex,
        whiteMove: {
          move: "...",
          color: "white",
          eval: undefined,
        },
        whiteBranches: [],
        blackMove: {
          move: mainLine.move!,
          color: "black",
          eval: mainLine.eval,
        },
        blackBranches: alternativeBranches.map((branch) =>
          transformToMovePairs(branch, currentIndex + 1),
        ),
      };

      pairs.push(pair);
      currentNode = mainLine;
      currentIndex++;
    } else {
      break;
    }
  }

  return pairs;
}
