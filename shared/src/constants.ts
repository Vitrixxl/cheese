export const GAME_TIME_CONTROLS = {
  bullet: ["1 min", "1 | 1", "2 | 1"],
  blitz: ["3 min", "3 | 2", "5 min"],
  rapid: ["10 | 5", "15 | 10", "30 min"],
  // classic: ["Daily", "Daily 960", "Custom Long"],
} as const;

export const TIME_CONTROL_TO_CATEGORY = {
  "1 min": "bullet",
  "1 | 1": "bullet",
  "2 | 1": "bullet",
  "3 min": "blitz",
  "3 | 2": "blitz",
  "5 min": "blitz",
  "10 | 5": "rapid",
  "15 | 10": "rapid",
  "30 min": "rapid",
} as const;

export const TIME_CONTROL_INCREMENTS = {
  "1 | 1": 1_000,
  "2 | 1": 1_000,
  "3 | 2": 2_000,
  "10 | 5": 5_000,
  "15 | 10": 10_000,
} as const;

export const OUTCOMES = [
  "checkmate",
  "stalemate",
  "draw",
  "timeout",
  "resign",
] as const;
