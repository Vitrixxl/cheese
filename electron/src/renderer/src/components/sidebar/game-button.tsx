import { GAME_TYPES, type GameType } from "@shared";
import { Button } from "../ui/button";
import React, { type ForwardRefExoticComponent } from "react";
import { LucideChevronLeft, type LucideProps } from "lucide-react";
import { capitalize, cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { SidebarMenuButton, SidebarMenuSubButton } from "../ui/sidebar";

export type GameButtonProps = {
  gameType: keyof typeof GAME_TYPES;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  selected: GameType | null;
  onSelect: (gameType: GameType) => void;
};
export const GameButton = ({
  gameType,
  onSelect,
  selected,
  ...props
}: GameButtonProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const gameTypes = GAME_TYPES[gameType];
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="flex justify-between" variant="outline">
          <div className="flex gap-2">
            <props.icon
              className="size-5"
              style={{
                color: `var(--${gameType}-color)`,
              }}
            />
            <h2 className="font-semibold">{capitalize(gameType)}</h2>
          </div>
          <LucideChevronLeft
            className={cn(
              "transition-transform size-4",
              isOpen && "-rotate-90",
            )}
          />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex  gap-1 w-full mt-1">
          {gameTypes.map((g) => (
            <SidebarMenuSubButton
              size="sm"
              key={g}
              className={cn(
                "!bg-background hover:!bg-accent justify-center font-semibold text-xs flex-1",
                selected == g && "text-foreground !bg-input/50",
              )}
              onClick={() => onSelect(g)}
              asChild
            >
              <button>{g}</button>
            </SidebarMenuSubButton>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
