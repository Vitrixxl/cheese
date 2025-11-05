import { Challenge, tryCatchAsync, type GameType } from "@shared";
import type { User } from "../lib/auth";
import { WsMessage, WsServerMessage } from "@backend/lib/types";
import { ElysiaWS } from "elysia/ws";
import { gameServerApi } from "backend/lib/api";
import { getUsersById } from "./social";

const MAX_ELO_DIFF = 50;

export const matchmakingServiceMessageKeys = [
  "joinQueue",
  "quitQueue",
  "challenge",
  "cancelChallenge",
];

export class MatchmakingService {
  private readonly queueMap = new Map<GameType, Map<User["id"], User>>();
  private readonly userWsMap: Record<User["id"], ElysiaWS[]> = {};
  private readonly challenges: Record<string, Challenge> = {};

  private readonly incomingChallenges: Record<User["id"], Set<string>> = {};

  private readonly outgoingChallenges: Record<User["id"], Set<string>> = {};

  constructor() {}

  private matchPlayers() {
    console.log("matching");
    this.queueMap.forEach((queue, gameType) => {
      const players = Array.from(queue.values());
      players.forEach((player) => {
        let bestMatch: { user: User; diff: number } | null = null;

        for (const candidate of players) {
          if (candidate.id === player.id) continue;
          const diff = Math.abs(player.elo - candidate.elo);
          if (diff > MAX_ELO_DIFF) continue;
          if (!bestMatch || bestMatch.diff > diff) {
            bestMatch = { user: candidate, diff };
          }
        }

        if (bestMatch) {
          console.log("BEST MATCH");
          this.createGame({ gameType, users: [player, bestMatch.user] });
          queue.delete(player.id);
          queue.delete(bestMatch.user.id);
          return;
        }

        console.log("nomatch");
      });
    });
  }

  private joinQueue({ user, gameType }: { user: User; gameType: GameType }) {
    let queue = this.queueMap.get(gameType);
    if (!queue) {
      queue = new Map<User["id"], User>();
      this.queueMap.set(gameType, queue);
    }
    queue.set(user.id, user);
    this.matchPlayers();
  }

  private createChallenge = ({ id, gameType, from, to, ranked }: Challenge) => {
    this.challenges[id] = { id, gameType, from, to, ranked };
    const outgoingChallenges = this.outgoingChallenges[from.id] || new Set();
    outgoingChallenges.add(id);
    this.outgoingChallenges[from.id] = outgoingChallenges;
    const incomingChallenges = this.incomingChallenges[to.id] || new Set();
    incomingChallenges.add(id);
    this.incomingChallenges[to.id] = incomingChallenges;
    this.send("challenge", to.id, { id, gameType, from, to, ranked });
  };

  private cancelChallenge = ({ id }: { id: string }) => {
    const challenge = this.challenges[id];
    if (!challenge) return;
    delete this.challenges[id];
    delete this.incomingChallenges[challenge.to.id];
    delete this.outgoingChallenges[challenge.from.id];
  };

  private leaveQueue = ({ userId }: { userId: User["id"] }) => {
    this.queueMap.forEach((queue) => queue.delete(userId));
  };

  private createGame = async ({
    gameType,
    users,
  }: {
    gameType: GameType;
    users: User[];
  }) => {
    const { data, error } = await gameServerApi["create-game"].post({
      gameType: gameType,
      users: users,
    });
    if (error) {
      console.error(error);
      return;
    }
    console.log({ data });
    for (const user of users) {
      this.send("game", user.id, {
        users,
        gameType,
        initialTimer: data.initialTimer,
        newGameId: data.newGameId,
      });
    }
  };

  private send<K extends keyof WsServerMessage>(
    key: K,
    userId: User["id"],
    payload: WsServerMessage[K],
  ) {
    const wsArray = this.userWsMap[userId];
    console.log({ wsArray });
    if (!wsArray || wsArray.length == 0) return;
    for (const ws of wsArray) {
      ws.send(
        JSON.stringify({
          key,
          payload,
        }),
      );
    }
  }

  handleConnection = ({ user, ws }: { user: User; ws: ElysiaWS }) => {
    this.userWsMap[user.id] = [...(this.userWsMap[user.id] ?? []), ws];
  };

  handleDisconnection = ({ user, ws }: { user: User; ws: ElysiaWS }) => {
    const connections = this.userWsMap[user.id];
    if (!connections) return;
    this.userWsMap[user.id] = connections.filter((w) => w.id != ws.id);
  };

  handleMessage = async ({
    key,
    payload,
    user,
  }: WsMessage & { user: User }) => {
    switch (key) {
      case "joinQueue": {
        this.joinQueue({ user, ...payload });
        break;
      }
      case "quitQueue": {
        this.leaveQueue({ userId: user.id });
        break;
      }
      case "challenge": {
        const { data, error } = await tryCatchAsync(getUsersById([payload.to]));
        if (error || data.length == 0) {
          return;
        }
        this.createChallenge({
          gameType: payload.gameType,
          id: payload.id,
          ranked: payload.ranked,
          to: data[0],
          from: user,
        });
        break;
      }
      case "cancelChallenge": {
        this.cancelChallenge({ id: payload.challengeId });
        break;
      }
      case "challengeResponse": {
        const currentChallenge = this.challenges[payload.challengeId];
        if (!currentChallenge) return;
        if (!payload.response) {
          this.send("declinedChallenge", currentChallenge.from.id, {
            challengeId: payload.challengeId,
          });
          return;
        }
        this.createGame({
          gameType: currentChallenge.gameType,
          users: [currentChallenge.from, currentChallenge.to],
        });
      }
    }
  };
}

export const matchmakingService = new MatchmakingService();
