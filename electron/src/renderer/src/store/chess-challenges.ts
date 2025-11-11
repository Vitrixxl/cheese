import type { Challenge } from "@shared";
import { atom } from "jotai";

export const chessChallengesAtom = atom<Challenge[]>([]);
