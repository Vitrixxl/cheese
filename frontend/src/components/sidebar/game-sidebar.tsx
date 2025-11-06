import { SidebarGroup, SidebarMenu } from "../ui/sidebar";
import { GAME_TYPES } from "@shared";
import { Zap, Flame, Timer, Hourglass } from "lucide-react";
import { GameButton } from "./game-button";
import { useQueue } from "@/hooks/use-queue";

const gameIconMap = {
  bullet: Zap,
  blitz: Flame,
  rapid: Timer,
  classic: Hourglass,
} as const;
export default function GameSidebar() {
  const { enterQueue } = useQueue();
  return (
    <SidebarGroup>
      <SidebarMenu className="flex flex-col gap-2">
        {Object.entries(GAME_TYPES).map(([k]) => (
          <GameButton
            key={k}
            gameType={k as keyof typeof GAME_TYPES}
            icon={gameIconMap[k as keyof typeof GAME_TYPES]}
            onSelect={enterQueue}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
