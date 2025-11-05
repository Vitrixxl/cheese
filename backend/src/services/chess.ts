import { Chess, Color } from "chess.js";
import { socketinator } from "../lib/socket";
import type { GameType, Outcome } from "@shared";
import type { User } from "../lib/auth";

export type ChessGameMessage = {
  userId: User["id"];
  content: string;
};

export interface Player extends User {
  color: Color;
}

export type ChessGame = {
  id: string;
  chess: Chess;
  players: Player[];
  timers: Record<Color, number>;
  drawOfferer: User["id"] | null;
  messages: ChessGameMessage[];
  competitive: boolean;
  outcome: Outcome | null;
  winner: Color | null;
};

export const userGameMap = new Map<string, Map<string, ChessGame>>();
export const gamesMap = new Map<string, ChessGame>();
const timerIntervals = new Map<string, ReturnType<typeof setInterval>>();

// All timer values are stored in milliseconds.
export const INITIALS_TIMERS: Record<GameType, number> = {
  "1 min": 60_000,
  "1 | 1": 60_000,
  "2 | 1": 120_000,
  "3 min": 180_000,
  "3 | 2": 180_000,
  "5 min": 300_000,
  "10 | 5": 600_000,
  "15 | 10": 900_000,
  "30 min": 1_800_000,
  Daily: 86_400_000, // 1 day
  "Daily 960": 86_400_000, // same as Daily
  "Custom Long": 3_600_000, // example: 1 hour default for custom
};

export const setColors = (users: User[]): Player[] => {
  const players: Player[] = [];
  const firstPlayerColor: Color = Math.random() > 0.5 ? "w" : "b";
  players.push({ ...users[0], color: firstPlayerColor });
  players.push({ ...users[1], color: firstPlayerColor == "w" ? "b" : "w" });
  return players;
};

export const startGame = (
  users: User[],
  gameType: GameType,
  competitive: boolean,
) => {
  const players = setColors(users);
  const gameId = Bun.randomUUIDv7();
  const initialTimer = INITIALS_TIMERS[gameType];
  if (!initialTimer) return;
  const chessGame: ChessGame = {
    id: gameId,
    chess: new Chess(),
    timers: {
      w: initialTimer,
      b: initialTimer,
    },
    players,
    drawOfferer: null,
    messages: [],
    competitive,
    outcome: null,
    winner: null,
  };
  gamesMap.set(gameId, chessGame);
  createTimer(chessGame);
  for (const p of players) {
    const opponent = chessGame.players.find((p2) => p2.id != p.id);
    if (!opponent) continue;
    socketinator.send({
      group: "chess",
      key: "start",
      userId: p.id,
      payload: {
        gameId,
        color: p.color,
        opponent,
      },
    });
  }
};

export const handleTimeout = (chessGame: ChessGame, loser: Color) => {
  chessGame.outcome = "timeout";
  chessGame.winner = loser == "w" ? "b" : "w";
};

export const createTimer = (chessGame: ChessGame) => {
  let lastTick = 0;

  const interval = setInterval(() => {
    timerIntervals.set(chessGame.id, interval);
    const turn = chessGame.chess.turn();
    if (lastTick == 0) lastTick = performance.now();
    const now = performance.now();
    const elapsedMs = now - lastTick;
    lastTick = now;
    if (elapsedMs <= 0) {
      return;
    }
    chessGame.timers[turn] -= elapsedMs;
    if (chessGame.timers[turn] == 0) {
      handleTimeout(chessGame, turn);
      clearInterval(interval);
    }
  }, 25);
};

export const finishGame = (chessGame: ChessGame) => {
  const interval = timerIntervals.get(chessGame.id);
  if (interval) {
    clearInterval(interval);
    timerIntervals.delete(chessGame.id);
  }
  if (!chessGame.outcome) return;
  for (const p of chessGame.players) {
    socketinator.send({
      group: "chess",
      key: "end",
      userId: p.id,
      payload: {
        outcome: chessGame.outcome,
        winner: chessGame.winner,
      },
    });
  }
};

export const handleMove = (
  chessGame: ChessGame,
  move: string,
  userId: string,
) => {
  const player = chessGame.players.find((p) => p.id == userId);
  const opponent = chessGame.players.find((p) => p.id != userId);
  if (!player || chessGame.chess.turn() != player.color || !opponent) return;
  if (!chessGame.chess.moves().includes(move)) return;
  chessGame.chess.move(move);
  socketinator.send({
    group: "chess",
    key: "move",
    userId: opponent.id,
    payload: {
      move,
      timers: chessGame.timers,
    },
  });
};

export const handleDrawOffer = (chessGame: ChessGame, userId: User["id"]) => {
  chessGame.drawOfferer = userId;
};

export const handleDrawResponse = (
  chessGame: ChessGame,
  userId: User["id"],
  response: boolean,
) => {
  if (!response || !chessGame.drawOfferer || chessGame.drawOfferer == userId)
    return;
  chessGame.outcome = "draw";
  finishGame(chessGame);
};

export const handleResign = (chessGame: ChessGame, userId: User["id"]) => {
  chessGame.outcome == "resign";
  const player = chessGame.players.find((p) => p.id == userId);
  if (!player) return;
  chessGame.winner = player.color == "w" ? "b" : "w";
  finishGame(chessGame);
};

export const handleMessage = (
  chessGame: ChessGame,
  userId: User["id"],
  content: string,
) => {
  chessGame.messages.push({
    userId,
    content,
  });
  const opponent = chessGame.players.find((p) => p.id != userId);
  if (!opponent) return;
  socketinator.send({
    group: "chess",
    key: "message",
    userId: opponent.id,
    payload: { content, gameId: chessGame.id },
  });
};

// SOCKET HANDLERS
socketinator.on("chess", "move", ({ gameId, userId, move }) => {
  const chessGame = userGameMap.get(userId)?.get(gameId);
  if (!chessGame) return;
  handleMove(chessGame, move, userId);
});

socketinator.on("chess", "draw-offer", ({ gameId, userId }) => {
  const chessGame = userGameMap.get(userId)?.get(gameId);
  if (!chessGame) return;
  handleDrawOffer(chessGame, userId);
});

socketinator.on("chess", "draw-response", ({ gameId, response, userId }) => {
  const chessGame = userGameMap.get(userId)?.get(gameId);
  if (!chessGame) return;
  handleDrawResponse(chessGame, userId, response);
});

socketinator.on("chess", "resign", ({ gameId, userId }) => {
  const chessGame = userGameMap.get(userId)?.get(gameId);
  if (!chessGame) return;
  handleResign(chessGame, userId);
});
socketinator.on("chess", "message", ({ gameId, content, userId }) => {
  const chessGame = userGameMap.get(userId)?.get(gameId);
  if (!chessGame) return;
  handleMessage(chessGame, userId, content);
});
