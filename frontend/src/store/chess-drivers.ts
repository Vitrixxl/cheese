import type { DriverType } from "@/types";
import { atom } from "jotai";

export const currentDriver = atom<DriverType>("local");
