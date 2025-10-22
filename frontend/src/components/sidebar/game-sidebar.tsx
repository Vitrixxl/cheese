import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "../ui/sidebar";
import { GAME_TYPES } from "@shared";
import { Zap, Flame, Timer, Hourglass } from "lucide-react";

const gameIconMap: Record<string, ReactNode> = {
  bullet: <Zap className="size-12 group-hover/button:text-yellow-500" />,
  blitz: <Flame className="size-12 group-hover/button:text-orange-500" />,
  rapid: <Timer className="size-12 group-hover/button:text-green-500" />,
  classic: <Hourglass className="size-12 group-hover/button:text-blue-500" />,
};
console.log(GAME_TYPES);
export default function GameSidebar() {
  return (
    <SidebarGroup>
      <SidebarMenu className="grid grid-cols-2 grid-rows-2 gap-2">
        {Object.entries(GAME_TYPES).map(([k]) => (
          <Button
            className="aspect-square !size-auto flex flex-col group/button"
            variant={"outline"}
            key={k}
          >
            {gameIconMap[k]}
            <span className="text-lg">{k}</span>
          </Button>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
