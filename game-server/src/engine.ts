import { tryCatch, type Outcome, type User } from "@shared";
import { Game } from "./types/game";
import { ElysiaWS } from "elysia/ws";
import { ChessClientMessage, ChessServerMessages } from "./types/schema";
import { Color } from "chess.js";
import { api } from "./lib/api";

export class GameInstance {
  game: Game;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  timers: Record<Color, number> | null = null;
  constructor(game: Game) {
    this.game = game;
    this;
  }

  private send<K extends keyof ChessServerMessages>(
    key: K,
    userId: User["id"],
    payload: ChessServerMessages[K],
  ) {
    const ws = this.game.users[userId].ws;
    if (!ws) return;
    ws.send(
      JSON.stringify({
        key,
        payload,
      }),
    );
  }

  private finishGame = async (outcome: Outcome, winner: Color | null) => {
    for (const [userId] of Object.entries(this.game.users)) {
      this.send("end", userId, {
        outcome,
        winner,
      });
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    const result = await api.game.save.post({
      gameId: this.game.id,
      outcome,
      winner,
      users: Object.entries(this.game.users).map(([userId, user]) => ({
        userId,
        color: user.color,
      })),
      messages: this.game.messages,
      timers: this.game.timers,
    });
    console.log(result);
  };

  private startTimers = () => {
    let lastTick = 0;

    const interval = setInterval(() => {
      const turn = this.game.chess.turn();
      if (lastTick == 0) lastTick = performance.now();
      const now = performance.now();
      const elapsedMs = now - lastTick;
      lastTick = now;
      if (elapsedMs <= 0) {
        return;
      }
      this.game.timers[turn] -= elapsedMs;
      if (this.game.timers[turn] <= 0) {
        this.finishGame("timeout", turn == "w" ? "b" : "w");
      }
    }, 10);
    this.timerInterval = interval;
  };

  private startGame = () => {
    this.startTimers();
    Object.entries(this.game.users).forEach(([userId]) => {
      this.send("start", userId, null);
    });
  };

  addConnection = ({ userId, ws }: { userId: User["id"]; ws: ElysiaWS }) => {
    this.game.users[userId].ws = ws;
    this.send("connection", this.game.opponentByUserId[userId].id, null);
    if (!this.game.firstConRecord[userId]) {
      this.game.firstConRecord[userId] = false;
      if (this.game.firstConRecord[this.game.opponentByUserId[userId].id]) {
        this.startGame();
      }
      return;
    }
    this.send("gameStatus", userId, {
      timers: this.game.timers,
      messages: this.game.messages,
      gameType: this.game.gameType,
      opponent: this.game.opponentByUserId[userId],
    });
  };

  dropConnection = ({ userId }: { userId: User["id"] }) => {
    this.game.users[userId].ws = null;
    this.send("disconnection", this.game.opponentByUserId[userId].id, null);
  };

  handleMessage = ({
    key,
    payload,
    userId,
  }: ChessClientMessage & { userId: User["id"] }) => {
    const opponentId = this.game.opponentByUserId[userId].id;
    switch (key) {
      case "move": {
        const { error } = tryCatch(() => this.game.chess.move(payload.move));
        if (error) return;

        this.send("move", opponentId, {
          move: payload.move,
          timers: this.game.timers,
        });

        if (this.game.chess.isCheckmate()) {
          this.finishGame(
            "checkmate",
            this.game.chess.turn() == "w" ? "b" : "w",
          );
          break;
        }
        if (this.game.chess.isDraw()) {
          this.finishGame("stalemate", null);
          break;
        }
        break;
      }
      case "message": {
        this.game.messages.push({
          userId,
          content: payload.content,
        });
        this.send("message", opponentId, payload);
        break;
      }
      case "resign": {
        this.finishGame("resign", this.game.opponentByUserId[userId].color);
        break;
      }
      case "drawOffer": {
        this.send("drawOffer", opponentId, null);
        break;
      }
      case "drawResponse": {
        if (payload.response) {
          this.finishGame("draw", null);
        }
        break;
      }
    }
  };
}
