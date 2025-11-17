import { gameMap } from "@game-server";
import { GameState } from "@game-server/types";

export const getGameState = (gameId: string): GameState | null => {
  const game = gameMap.get(gameId);
  if (!game) return null;
  return {
    id: game.game.id,
    messages: game.game.messages,
    timerIncrement: game.game.timerIncrement,
    timers: game.game.timers,
    users: game.game.users,
    timeControl: game.game.timeControl,
    drawOffer: game.game.drawOffer,
    movesHistory: game.game.chess.history(),
  };
};
