import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { isInQueueAtom } from "@/store";
import type { WsMessage } from "@backend";
import type { GameType } from "@shared";
import { useAtom } from "jotai";
import React from "react";

export const useQueue = () => {
  const { data } = auth.useSession();
  const [ws, setWs] = React.useState<ReturnType<
    typeof api.ws.subscribe
  > | null>(null);
  const [isInQueue, setIsInQueue] = useAtom(isInQueueAtom);

  const enterQueue = (gameType: GameType) => {
    if (!ws) return;
    ws.send({
      key: "joinQueue",
      payload: {
        gameType,
      },
    } satisfies WsMessage);
    setIsInQueue(true);
  };

  const leaveQueue = () => {
    if (!ws) return;
    setIsInQueue(false);
    ws.send({
      key: "quitQueue",
      payload: null,
    } satisfies WsMessage);
  };

  React.useEffect(() => {
    if (ws && data) return;
    if (data) {
      setWs(api.ws.subscribe());
      return;
    }
    setWs(null);
  }, [data]);

  return {
    enterQueue,
    isInQueue,
    leaveQueue,
  };
};
