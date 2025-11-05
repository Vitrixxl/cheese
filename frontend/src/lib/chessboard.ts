export const fileLetters = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const rankNumbers = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export type FileLetter = (typeof fileLetters)[number];
export type RankNumber = (typeof rankNumbers)[number];
