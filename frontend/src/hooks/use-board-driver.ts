import {
  useBoardController,
  type BoardController,
} from "./use-board-controller";
import React from "react";
import type { DriverType, LocalMove } from "@/types/chess";

export type BoardDriver = {
  id: DriverType;
  start?: (ctx: BoardController) => (() => void) | void;
  onLocalMove?(move: LocalMove, ctx: BoardController): boolean;
};

export function useBoardDriver(driver: BoardDriver) {
  const controller = useBoardController();

  React.useEffect(
    () => driver.start && driver.start(controller),
    [driver, controller],
  );

  const playMove = (move: LocalMove) => {
    if (driver.onLocalMove) {
      const handled = driver.onLocalMove(move, controller);
      if (handled === false) return false;
    }
    return controller.applyLocalMove(move);
  };

  return { controller, playMove };
}
