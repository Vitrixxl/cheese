import type { Color } from "chess.js";
import { atom } from "jotai";

export const gameIdAtom = atom<string | null>(null);
export const isInQueueAtom = atom<boolean>(false);
export const colorAtom = atom<Color | null>(null);
