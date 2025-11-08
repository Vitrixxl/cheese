import { SidebarGroup, SidebarMenu } from "../ui/sidebar";
import { GAME_TYPES, type GameType } from "@shared";
import { Zap, Flame, Timer, Hourglass } from "lucide-react";
import { GameButton } from "./game-button";
import { useQueue } from "@/hooks/use-queue";
import React from "react";
import { Button } from "../ui/button";

export const gameIconMap = {
  bullet: Zap,
  blitz: Flame,
  rapid: Timer,
  classic: Hourglass,
} as const;
export default function GameSidebar() {
  const { enterQueue, isInQueue, leaveQueue } = useQueue();
  const [selected, setSelected] = React.useState<GameType | null>(null);
  return (
    <SidebarGroup>
      <SidebarMenu className="flex flex-col gap-4">
        {Object.entries(GAME_TYPES).map(([k]) => (
          <GameButton
            key={k}
            gameType={k as keyof typeof GAME_TYPES}
            icon={gameIconMap[k as keyof typeof GAME_TYPES]}
            selected={selected}
            onSelect={(g) =>
              selected == g ? setSelected(null) : setSelected(g)
            }
          />
        ))}
        {selected && (
          <Button
            className=""
            onClick={() => enterQueue(selected)}
            disabled={isInQueue}
          >
            {isInQueue ? "Finding an opponenent..." : "Start"}
          </Button>
        )}
        {isInQueue && (
          <Button variant={"destructive"} onClick={() => leaveQueue()}>
            Cancel
          </Button>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
