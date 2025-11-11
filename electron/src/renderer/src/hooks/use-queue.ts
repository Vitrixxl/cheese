import { isInQueueAtom } from "@/store";
import { hubWsAtom } from "@/store/ws";
import type { WsMessage } from "@backend";
import type { GameType } from "@shared";
import { useAtom, useAtomValue } from "jotai";

export const useQueue = () => {
  const ws = useAtomValue(hubWsAtom);
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

  return {
    enterQueue,
    isInQueue,
    leaveQueue,
  };
};
