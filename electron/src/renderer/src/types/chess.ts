import type { Chess } from "chess.js";

export type DriverType = "online" | "puzzle" | "local";
export type LocalMove = {
  from: string;
  to: string;
  promotion?: string;
};

export type Board = ReturnType<Chess["board"]>;
