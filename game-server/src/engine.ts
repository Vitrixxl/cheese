import { tryCatch, type Outcome, type User } from "@shared";
import { ServerGame } from "./types/game";
import { ElysiaWS } from "elysia/ws";
import { ChessClientMessage, ChessServerMessages } from "./types/schema";
import { Color } from "chess.js";
import { api } from "./lib/api";

export class GameInstance {
  game: ServerGame;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  constructor(game: ServerGame) {
    this.game = game;
    this;
  }

  private send<K extends keyof ChessServerMessages>(
    key: K,
    userId: User["id"],
    payload: ChessServerMessages[K],
  ) {
    const ws = this.game.users[userId].ws;
    console.log({ ws, key, payload });
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
      pgn: this.game.chess.pgn(),
      outcome,
      winner,
      timeControl: this.game.timeControl,
      users: Object.entries(this.game.users).map(([userId, user]) => ({
        userId,
        color: user.color,
      })),
      messages: this.game.messages,
      timers: this.game.timers,
    });
    console.log({ result });
  };

  private incrementTimer = () => {
    if (this.game.chess.turn() == "w") {
      this.game.timers.b += this.game.timerIncrement;
      return;
    }
    this.game.timers.w += this.game.timerIncrement;
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
    const opponentId = this.game.opponentByUserId[userId];
    this.send("connection", opponentId, null);
    if (!this.game.firstConRecord[userId]) {
      this.game.firstConRecord[userId] = true;
      if (this.game.firstConRecord[opponentId]) {
        this.startGame();
      }
      return;
    }
    this.send("gameStatus", userId, {
      timers: this.game.timers,
      messages: this.game.messages,
      timeControl: this.game.timeControl,
      opponent: this.game.users[opponentId],
    });
  };

  dropConnection = ({ userId }: { userId: User["id"] }) => {
    this.game.users[userId].ws = null;
    this.send("disconnection", this.game.opponentByUserId[userId], null);
  };

  handleMessage = ({
    key,
    payload,
    userId,
  }: ChessClientMessage & { userId: User["id"] }) => {
    const opponentId = this.game.opponentByUserId[userId];
    switch (key) {
      case "move": {
        const { error } = tryCatch(() => this.game.chess.move(payload.move));
        if (error) {
          console.error(error);
          return;
        }
        this.incrementTimer();

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
        this.send("message", opponentId, { userId, content: payload.content });
        break;
      }
      case "resign": {
        this.finishGame(
          "resign",
          this.game.users[this.game.opponentByUserId[userId]].color,
        );
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
