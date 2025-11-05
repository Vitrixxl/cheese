import { api } from "@/lib/api";
import { chessChallengesAtom } from "@/store/chess-challenges";
import { currentDriver, gameIdAtom, isInQueueAtom, store } from "@/store";
import type { WsServerMessageWithKey } from "@backend";
import React from "react";
import useGameWs from "./use-game-ws";

export default function useHubWs() {
  const [gameId, setGameId] = React.useState<string | null>(null);
  useGameWs(gameId);

  const ws = api.ws.subscribe();

  ws.on("close", () => console.log("closed"));
  ws.on("message", (a) => {
    const { key, payload } = a.data as WsServerMessageWithKey;
    switch (key) {
      case "game": {
        store.set(gameIdAtom, payload.newGameId);
        store.set(currentDriver, "online");
        store.set(isInQueueAtom, false);
        setGameId(payload.newGameId);
        break;
      }

      case "declinedChallenge": {
        store.set(chessChallengesAtom, (prev) =>
          prev.filter((c) => c.id != payload.challengeId),
        );
        break;
      }
      case "challenge": {
        store.set(chessChallengesAtom, (prev) => [...prev, payload]);
        break;
      }
    }
  });
}
