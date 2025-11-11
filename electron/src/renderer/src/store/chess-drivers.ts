import type { DriverType } from "@/types";
import { atom } from "jotai";

export const currentDriverAtom = atom<DriverType>("local");
