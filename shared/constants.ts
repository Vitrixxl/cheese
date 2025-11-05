export const GAME_TYPES = {
  bullet: ["1 min", "1 | 1", "2 | 1"],
  blitz: ["3 min", "3 | 2", "5 min"],
  rapid: ["10 | 5", "15 | 10", "30 min"],
  classic: ["Daily", "Daily 960", "Custom Long"],
} as const;
export const OUTCOMES = [
  "checkmate",
  "stalemate",
  "draw",
  "timeout",
  "resign",
] as const;
