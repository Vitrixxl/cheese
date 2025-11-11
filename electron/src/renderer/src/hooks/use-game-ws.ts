import { endGameDialogOpenAtom, gameIdAtom, gameMessagesAtom } from "@/store";
import React from "react";
import { useAtom, useSetAtom } from "jotai";
import { gameWsAtom } from "@/store/ws";
import { tryCatch } from "@shared";
import { gameApi } from "@/lib/api";
import { auth } from "@/lib/auth";
import type { WsChessServerMessageWithKey } from "@game-server/types/schema";
import { useBoardController } from "./use-board-controller";

export default function useGameWs() {
  const [ws, setWs] = useAtom(gameWsAtom);
  const [gameId] = useAtom(gameIdAtom);
  const { data: authData } = auth.useSession();
  const { applyLocalMove, reset, setOutcome } = useBoardController();
  const setGameMessages = useSetAtom(gameMessagesAtom);
  const setEndGameDialogOpen = useSetAtom(endGameDialogOpenAtom);
  const handleClose = () => {
    console.log("closing");
    setWs(null);
  };
  const handleMessage = (ev: MessageEvent<any>) => {
    const { key, payload } = ev.data as WsChessServerMessageWithKey;
    switch (key) {
      case "gameStatus": {
        break;
      }
      case "move": {
        console.log({ payload });
        applyLocalMove({ ...payload.move });
        break;
      }
      case "message": {
        console.log({ payload });
        setGameMessages((prev) => [...prev, payload]);
        break;
      }
      case "drawOffer":
      case "start": {
        console.log({ startin: "true" });

        reset();
        break;
      }
      case "end": {
        setOutcome(payload);
        setEndGameDialogOpen(true);
        break;
      }
      case "disconnection":
      case "connection":
    }
  };

  React.useEffect(() => {
    if (!ws) return;
    reset();
    ws.on("close", handleClose);
    ws.on("message", handleMessage);
    return () => {
      ws.off("close", handleClose);
      ws.off("message", handleMessage);
      ws.close();
    };
  }, [ws]);

  React.useEffect(() => {
    if (!gameId || !authData) {
      return;
    }

    if (!ws) {
      const { data, error } = tryCatch(() =>
        gameApi.ws.subscribe({ query: { userId: authData.user.id, gameId } }),
      );
      if (error) {
        return;
      }
      setWs(data);
      return;
    }
  }, [gameId, authData]);
}
