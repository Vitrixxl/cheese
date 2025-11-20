import { tryCatch, type Outcome, type User } from "@shared";
import { type ServerGame } from "./types/game";
import { ElysiaWS } from "elysia/ws";
import { type ChessClientMessage, type ChessServerMessages } from "./types/schema";
import { type Color } from "chess.js";
import { api } from "./lib/api";

export class GameInstance {
  game: ServerGame;
  userIdToWs: Record<User["id"], ElysiaWS[]> = {};
  timerInterval: ReturnType<typeof setInterval> | null = null;
  constructor(
    game: ServerGame,
    private readonly onFinish: () => void,
  ) {
    this.game = game;
    this.userIdToWs = {
      [Object.keys(game.users)[0]]: [],
      [Object.keys(game.users)[1]]: [],
    };
  }

  private send<K extends keyof ChessServerMessages>(
    key: K,
    userId: User["id"],
    payload: ChessServerMessages[K],
  ) {
    for (const ws of this.userIdToWs[userId]) {
      ws.send({
        key,
        payload,
      });
    }
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
    await api.game.save.post({
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
    this.onFinish();
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
    this.userIdToWs[userId].push(ws);
    const opponentId = this.game.opponentByUserId[userId];
    this.send("connection", opponentId, null);
    if (!this.game.firstConRecord[userId]) {
      this.game.firstConRecord[userId] = true;
      if (this.game.firstConRecord[opponentId]) {
        this.startGame();
      }
      return;
    }
    this.send("gameState", userId, {
      id: this.game.id,
      timers: this.game.timers,
      messages: this.game.messages,
      timeControl: this.game.timeControl,
      users: this.game.users,
      drawOffer: this.game.drawOffer,
      pgn: this.game.chess.pgn(),
      timerIncrement: this.game.timerIncrement,
    });
  };

  dropConnection = ({ userId, ws }: { userId: User["id"]; ws: ElysiaWS }) => {
    this.userIdToWs[userId].filter((w) => ws.id != w.id);
    if (this.userIdToWs[userId]?.length == 0) {
      this.send("disconnection", this.game.opponentByUserId[userId], null);
    }
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
        console.log("aa");
        console.log(this.game.drawOffer);
        if (this.game.drawOffer && this.game.drawOffer != userId) {
          this.finishGame("draw", null);
          break;
        }
        this.send("drawOffer", opponentId, null);
        this.game.drawOffer = userId;
        break;
      }
      case "drawResponse": {
        if (!this.game.drawOffer || this.game.drawOffer != userId) break;
        this.game.drawOffer = null;
        if (payload.response) {
          this.finishGame("draw", null);
          break;
        }
        break;
      }
    }
  };
}
