import {
  Challenge,
  Game,
  tryCatchAsync,
  UserWithElos,
  type GameTimeControl,
} from "@shared";
import type { User } from "../lib/auth";
import { WsMessage, WsServerMessage } from "@backend/lib/types";
import { ElysiaWS } from "elysia/ws";
import { gameServerApi } from "backend/lib/api";
import { getUsersById } from "./friend";

const MAX_ELO_DIFF = 50;

export const matchmakingServiceMessageKeys = [
  "joinQueue",
  "quitQueue",
  "challenge",
  "cancelChallenge",
];

export class MatchmakingService {
  private readonly queueMap = new Map<
    GameTimeControl,
    Map<User["id"], UserWithElos>
  >();
  private readonly userWsMap: Record<User["id"], ElysiaWS[]> = {};
  private readonly challenges: Record<string, Challenge> = {};
  private readonly userGameId: Record<User["id"], Game["id"]> = {};

  private readonly incomingChallenges: Record<User["id"], Set<string>> = {};

  private readonly outgoingChallenges: Record<User["id"], Set<string>> = {};

  constructor() {}

  private matchPlayers() {
    this.queueMap.forEach((queue, timeControl) => {
      const players = Array.from(queue.values());
      players.forEach((player) => {
        if (!queue.has(player.id)) return;

        let bestMatch: { user: User } | null = null;

        for (const candidate of players) {
          if (candidate.id === player.id) continue;
          if (!queue.has(candidate.id)) continue;
          bestMatch = { user: candidate };
        }

        if (!bestMatch) return;
        this.createGame({ timeControl, users: [player, bestMatch.user] });
        queue.delete(player.id);
        queue.delete(bestMatch.user.id);
      });
    });
  }

  private joinQueue({
    user,
    timeControl,
  }: {
    user: User;
    timeControl: GameTimeControl;
  }) {
    let queue = this.queueMap.get(timeControl);
    if (!queue) {
      queue = new Map<User["id"], User>();
      this.queueMap.set(timeControl, queue);
    }
    queue.set(user.id, user);
    this.matchPlayers();
  }

  private createChallenge = ({
    id,
    timeControl,
    from,
    to,
    ranked,
  }: Challenge) => {
    this.challenges[id] = { id, timeControl, from, to, ranked };
    const outgoingChallenges = this.outgoingChallenges[from.id] || new Set();
    outgoingChallenges.add(id);
    this.outgoingChallenges[from.id] = outgoingChallenges;
    const incomingChallenges = this.incomingChallenges[to.id] || new Set();
    incomingChallenges.add(id);
    this.incomingChallenges[to.id] = incomingChallenges;
    this.send("challenge", to.id, { id, timeControl, from, to, ranked });
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
    timeControl,
    users,
  }: {
    timeControl: GameTimeControl;
    users: User[];
  }) => {
    const { data, error } = await gameServerApi["create-game"].post({
      timeControl: timeControl,
      users: users,
    });
    if (error) {
      console.error(error);
      return;
    }

    for (const user of users) {
      this.userGameId[user.id] = data.newGameId;
      this.send("game", user.id, {
        users: data.users,
        timeControl,
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

  private sendGameState = async (userId: User["id"]) => {
    const gameId = this.userGameId[userId];
    if (!gameId) return;
    this.send("hasGame", userId, { gameId });
  };

  handleConnection = async ({ user, ws }: { user: User; ws: ElysiaWS }) => {
    this.userWsMap[user.id] = [...(this.userWsMap[user.id] ?? []), ws];
    this.sendGameState(user.id);
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
          timeControl: payload.timeControl,
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
          timeControl: currentChallenge.timeControl,
          users: [currentChallenge.from, currentChallenge.to],
        });
      }
    }
  };
}

export const matchmakingService = new MatchmakingService();
