import { atom } from "jotai";

export const gameIdAtom = atom<string | null>(null);
export const isInQueueAtom = atom<boolean>(false);
