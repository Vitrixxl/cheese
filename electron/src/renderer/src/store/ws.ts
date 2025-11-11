import type { api, gameApi } from "@/lib/api";
import { atom } from "jotai";

export const hubWsAtom = atom<ReturnType<typeof api.ws.subscribe> | null>(null);
export const gameWsAtom = atom<ReturnType<typeof gameApi.ws.subscribe> | null>(
  null,
);
