import {
  useBoardController,
  type BoardController,
} from "./use-board-controller";
import React from "react";
import type { DriverType, LocalMove } from "@/types/chess";

export type BoardDriver = {
  id: DriverType;
  start?: (ctx: BoardController) => (() => void) | void;
  onLocalMove?(move: LocalMove, ctx: BoardController): void;
};

export function useBoardDriver(driver: BoardDriver) {
  const controller = useBoardController();

  React.useEffect(
    () => driver.start && driver.start(controller),
    [driver, controller],
  );

  const playMove = (move: LocalMove) => {
    if (driver.onLocalMove) {
      driver.onLocalMove(move, controller);
    }
    return controller.applyLocalMove(move);
  };

  return { controller, playMove };
}
