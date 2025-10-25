import type { ReactNode } from "react";
import { SidebarGroup, SidebarMenu } from "../ui/sidebar";
import { GAME_TYPES } from "@shared";
import { Zap, Flame, Timer, Hourglass } from "lucide-react";
import { GameButton } from "./game-button";

const gameIconMap: Record<string, ReactNode> = {
  bullet: <Zap className="size-12 group-hover/button:text-yellow-500" />,
  blitz: <Flame className="size-12 group-hover/button:text-orange-500" />,
  rapid: <Timer className="size-12 group-hover/button:text-green-500" />,
  classic: <Hourglass className="size-12 group-hover/button:text-blue-500" />,
};
export default function GameSidebar() {
  return (
    <SidebarGroup>
      <SidebarMenu className="grid grid-cols-2 grid-rows-2 gap-2">
        {Object.entries(GAME_TYPES).map(([k]) => (
          <GameButton
            gameType={k as keyof typeof GAME_TYPES}
            icon={gameIconMap[k]}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
